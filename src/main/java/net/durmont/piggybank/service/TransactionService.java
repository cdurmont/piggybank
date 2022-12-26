package net.durmont.piggybank.service;

import io.quarkus.hibernate.reactive.panache.Panache;
import io.quarkus.logging.Log;
import io.quarkus.panache.common.Page;
import io.quarkus.panache.common.Parameters;
import io.quarkus.panache.common.Sort;
import io.smallrye.mutiny.Uni;
import net.durmont.piggybank.model.Entry;
import net.durmont.piggybank.model.Instance;
import net.durmont.piggybank.model.Transaction;
import org.apache.commons.beanutils.BeanUtils;
import org.hibernate.reactive.mutiny.Mutiny;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import java.lang.reflect.InvocationTargetException;
import java.util.*;
import java.util.stream.Collectors;

@ApplicationScoped
public class TransactionService {

    @Inject EntryService entryService;

    public Uni<Transaction> create(Long instanceId, Transaction newTxn) {
        newTxn.setDefaults();
        if (newTxn.instance == null)
            newTxn.instance = new Instance();
        newTxn.instance.id = instanceId;
        // TODO changement de plan : revenir au système "persist de transaction => persist des écritures de la txn"
        return Panache.withTransaction(newTxn::persist);
    }

    public Uni<List<Transaction>> list(Long instanceId, Transaction filter, Sort sort, Page page) {
        Map<String, Object> params = new HashMap<>();
        String query ="1=1";
        query+=" AND instance.id=:instance_id";
        params.put("instance_id", instanceId);
        if (filter != null) {
            if (filter.balanced!= null) {
                query+=" AND balanced=:balanced";
                params.put("balanced", filter.balanced);
            }
            if (filter.reconciled!= null) {
                query+=" AND reconciled=:reconciled";
                params.put("reconciled", filter.reconciled);
            }
            if (filter.type != null) {
                query+=" AND type=:type";
                params.put("type", filter.type);
            }
            if (filter.owner != null && filter.owner.id != null) {
                query+=" AND owner.id=:owner_id";
                params.put("owner_id", filter.owner.id);
            }

        }
        return Transaction.find(query, sort, params)
                .page(page)
                .list();
    }

    public Uni<Transaction> findById(Long instanceId, Long id) {
        // will return the transaction UNLESS it is not from the given instance
        return Transaction.<Transaction>find("select t from Transaction t join fetch t.entries where t.id = ?1", id)
                .firstResult()
                .map(txn -> {
                    if (txn.entries != null)
                        for (Entry e : txn.entries) {
                            e.transaction = null;   // break recursion in JSON rendering
                        }
                    return txn != null && txn.instance != null && Objects.equals(instanceId, txn.instance.id) ? txn : null;
                });
    }

    /**
     * Updates the full transaction, including entries
     * Upon update, entries are deleted and recreated
     * @param instanceId
     * @param id
     * @param txn
     * @return
     */
    public Uni<Transaction> update(Long instanceId, Long id, Transaction txn) {
        txn.id=id;
        txn.setDefaults();
        return Panache.withTransaction(
                () -> findById(instanceId, id)  // 1.read full transaction w/ entries
                        .chain(txnDb -> {
                            // list of entry ids to delete. Better build this one before using copyProperties !
                            List<Long> ids = new ArrayList<>();
                            if (txnDb != null && txnDb.entries != null)
                                ids = txnDb.entries.stream().map(entry -> entry.id).collect(Collectors.toList());

                            // 2.update transaction (implicitly by updating an attached Entity)
                            try {
                                BeanUtils.copyProperties(txnDb, txn);
                            } catch (IllegalAccessException | InvocationTargetException e) {
                                Log.error("Error copying new properties of Transaction "+id, e);
                            }

                            return entryService.delete(instanceId, ids);    // 3. delete existing entries
                        })
                        .chain(() -> {
                            List<Uni<Entry>> uniEntries = new ArrayList<>();
                            if (txn.entries != null)
                                for( Entry entry : txn.entries) {
                                    entry.id = null;
                                    entry.transaction = txn;
                                    uniEntries.add(entryService.create(instanceId, entry));
                                }
                            return Uni.join().all(uniEntries).andFailFast();    // 4.create entries
                        })
                        .map( createResult -> {
                            txn.entries = null;
                            return txn;
                        })    // the last mapping is somewhat bogus, if we made it to this point without failing, we assume everything is ok, and txn is returned (txnDb would be more accurate...)
        );
    }
    public Uni<Transaction> updateTxnOnly(Long instanceId, Long id, Transaction txn) {
        txn.id=id;
        txn.setDefaults();
        return Panache.withTransaction(
                ()-> Transaction.<Transaction>findById(id)
                        .map(txnDb -> {
                            if (txnDb != null && txnDb.instance != null && !Objects.equals(instanceId, txnDb.instance.id))
                                return null;
                            txn.instance = txnDb.instance;
                            try {
                                BeanUtils.copyProperties(txnDb, txn);
                            } catch (IllegalAccessException | InvocationTargetException e) {
                                Log.error("Error copying new properties of Transaction "+id, e);
                            }
                            return txnDb;
                        })
        );
    }

    public Uni<Long> delete(Long instanceId, Long id) {
        return Panache.withTransaction(
                () -> findById(instanceId, id)  // 1.read full transaction w/ entries
                        .chain(txnDb -> {
                            List<Long> ids = new ArrayList<>();
                            if (txnDb != null && txnDb.entries != null)
                                ids = txnDb.entries.stream().map(entry -> entry.id).collect(Collectors.toList());   // list of entry ids to delete
                            return entryService.delete(instanceId, ids);    // 2.delete entries
                        })
                        .chain(() -> Transaction.delete("instance.id=:instance_id and id=:id", Parameters.with("instance_id",instanceId).and("id",id))) // 3.delete transaction
                );
    }
}
