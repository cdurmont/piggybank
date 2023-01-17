package net.durmont.piggybank.service;

import io.quarkus.cache.CacheResult;
import io.quarkus.hibernate.reactive.panache.Panache;
import io.quarkus.logging.Log;
import io.quarkus.panache.common.Page;
import io.quarkus.panache.common.Parameters;
import io.quarkus.panache.common.Sort;
import io.smallrye.mutiny.Uni;
import net.durmont.piggybank.model.Account;
import net.durmont.piggybank.model.Entry;
import net.durmont.piggybank.model.Instance;
import org.apache.commons.beanutils.BeanUtils;

import javax.enterprise.context.ApplicationScoped;
import javax.validation.constraints.NotNull;
import java.lang.reflect.InvocationTargetException;
import java.math.BigDecimal;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@ApplicationScoped
public class AccountService {


    public Uni<List<Account>> getAccountTree(Long instanceId) {

        return getAllAccounts(instanceId).map(
                accounts -> accounts.stream()                       // from the list of all Accounts for this instance
                        .peek(account -> {
                            if (account.root == null) {
                                if (account.parent != null) {
                                    account.parent = null;                    // since we put a lot of energy on building the subAccounts lists, delete the parent instead
                                    account.root = Boolean.FALSE;
                                }
                                else
                                    account.root = Boolean.TRUE;
                            }
                        })
                        .filter(account -> account.root == Boolean.TRUE)  // keep only those without parent (root Accounts)
                        .sorted()
                        .collect(Collectors.toList())
        );
    }

    public Uni<List<Account>> list(Long instanceId, Account filter, Sort sort, Page page) {

        Map<String, Object> params = new HashMap<>();
        String query ="1=1";
        query+=" AND instance.id=:instance_id";
        params.put("instance_id", instanceId);
        if (filter != null) {
            if (filter.id!= null) {
                query+=" AND id=:id";
                params.put("id", filter.id);
            }
            if (filter.colorRevert!= null) {
                query+=" AND colorRevert=:colorRevert";
                params.put("colorRevert", filter.colorRevert);
            }
            if (filter.reconcilable!= null) {
                query+=" AND reconcilable=:reconcilable";
                params.put("reconcilable", filter.reconcilable);
            }
            if (filter.externalRef!= null) {
                query+=" AND externalRef=:externalRef";
                params.put("externalRef", filter.externalRef);
            }
            if (filter.mongoId!= null) {
                query+=" AND mongoId=:mongoId";
                params.put("mongoId", filter.mongoId);
            }
            if (filter.name!= null) {
                query+=" AND name=:name";
                params.put("name", filter.name);
            }
            if (filter.type!= null) {
                query+=" AND type=:type";
                params.put("type", filter.type);
            }
            if (filter.parent!= null && filter.parent.id != null) {
                query+=" AND parent.id=:parent_id";
                params.put("parent_id", filter.parent.id);
            } else if (filter.root == Boolean.TRUE) {
                query+=" AND parent is null";
            }
        }
        return Account.find(query, sort, params)
                .page(page)
                .list();
    }

    public Uni<List<Long>> getChildrenAccountIds(Long instanceId, Long accountId) {
        return getAllAccounts(instanceId).map(accounts -> getChildrenAccountIdsInternal(accounts, accountId));
    }


    @CacheResult(cacheName = "accounts-cache")
    public Uni<List<Account>> getAllAccounts(Long instanceId) {

        return Account.<Account>listAll()
                .onItem().ifNotNull()
                .transform(accounts -> {
                    List<Account> instanceAccounts = accounts.stream().filter(account -> account != null && account.instance != null && Objects.equals(instanceId, account.instance.id)).collect(Collectors.toList());
                    return relinkAccounts(instanceAccounts);
                });
    }

    public Uni<BigDecimal> balance(Long instanceId, @NotNull Long id) {
        // call accountCache, get ids of subaccounts
        return Account.getSession()
                .chain(
                    session -> getChildrenAccountIds(instanceId, id).onItem().transformToUni(
                            ids -> {
                                ids.add(id);    // add main account's id too
                                return session.<BigDecimal>createNamedQuery("balance").setParameter("accountIds", ids).getSingleResult();
                            }))
                ;
    }

    private List<Account> relinkAccounts(List<Account> accounts) {
        // create a Map of accounts indexed on ids
        Map<Long, Account> accountMap = accounts.stream().collect(Collectors.toMap(Account::getId, Function.identity()));
        for (Account account : accounts) {
            if (account.parent != null) {   // if this account has a parent, find the parent through the Map...
                Account parent = accountMap.get(account.parent.id);
                if (parent.subAccounts == null)
                    parent.subAccounts = new ArrayList<>();
                parent.subAccounts.add(account); // then add the account as a sub of the parent
            }
        }
        return accounts;
    }
    private List<Long> getChildrenAccountIdsInternal(List<Account> accounts, Long accountId) {
        List<Long> ids = new ArrayList<>();
        // step 1 : get the Account
        Account acc = accounts.stream().filter(account -> Objects.equals(account.id, accountId))
                .findAny().orElse(null);
        // step 2 : add the subAccounts to the list
        if (acc != null) {
            if (acc.subAccounts != null)
                for (Account sub : acc.subAccounts) {
                    ids.add(sub.id);
                    ids.addAll(getChildrenAccountIdsInternal(accounts, sub.id));
                }
        }
        return ids;
    }

    public Uni<Account> findById(Long instanceId, Long id) {
        // will return the account UNLESS it is not from the given instance
        return Account.<Account>findById(id)
                .map(account -> account != null && account.instance != null && Objects.equals(instanceId, account.instance.id) ? account : null);
    }

    public Uni<Account> create(Long instanceId, Account newAccount) {
        newAccount.setDefaults();
        if (newAccount.instance == null)
            newAccount.instance = new Instance();
        newAccount.instance.id = instanceId;
        return Panache.withTransaction(newAccount::persist);
    }

    public Uni<Account> update(Long instanceId, Long id, Account account) {
        account.id=id;
        account.setDefaults();
        return Panache.withTransaction(
                ()-> Account.<Account>findById(id)
                        .map(accountDb -> {
                            if (accountDb != null && accountDb.instance != null && !Objects.equals(instanceId, accountDb.instance.id))
                                return null;
                            account.instance = accountDb.instance;
                            try {
                                BeanUtils.copyProperties(accountDb, account);
                            } catch (IllegalAccessException | InvocationTargetException e) {
                                Log.error("Error copying new properties of Account "+id, e);
                            }
                            return accountDb;
                        })
        );
    }

    public Uni<Long> delete(Long instanceId, Long id) {
        return Panache.withTransaction(() ->
                Account.delete("instance.id=:instance_id and id=:id", Parameters.with("instance_id",instanceId).and("id",id)));
    }

    public Uni<List<Entry>> getEntries(Long instanceId, Long accountId, boolean showReconciled, Page page) {
        if (accountId <= 0)
            return null;
        Map<String, Object> params = new HashMap<>();
        params.put("instanceId", instanceId);
        params.put("accountId", accountId);
        params.put("showReconciled", showReconciled);
//        return  Entry.findAll().page(page).list();
        return Entry.<Entry>find(
                "select distinct e from Entry e "
                        +"join fetch e.transaction t " +
                        "join fetch t.entries " +
                        "where e.account.id = :accountId " +
                        "and t.instance.id = :instanceId " +
                        "and t.type = 'S' " +
                        "and (t.reconciled = false or :showReconciled = true) " +
                        "order by e.date DESC "
                , params).list()
                .map(entries -> {
                    // remove unneeded stuff
                    for(Entry entry : entries) {
                        entry.transaction.entries.remove(entry);    // remove main entry from "contreparties"
                        for(Entry ctp : entry.transaction.entries)
                            ctp.transaction = null; // stop infinite recursion through lazy loading
                    }
                    // compute balance
                    BigDecimal balance = BigDecimal.ZERO;
                    for (int i = entries.size()-1; i >= 0 ; i--) {
                        balance = entries.get(i).balance(balance);
                    }
                    // pagination
                    int startIndex = page.size * page.index;
                    int endIndex = page.size * (page.index+1);
                    if (endIndex > entries.size())
                        endIndex = entries.size();
                    return entries.subList(startIndex, endIndex);
                });
    }
}
