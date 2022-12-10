package net.durmont.piggybank.model;


import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.quarkus.logging.Log;
import io.quarkus.panache.common.Page;
import io.quarkus.panache.common.Sort;
import io.smallrye.mutiny.Uni;
import net.durmont.piggybank.service.AccountService;
import org.apache.commons.beanutils.BeanUtils;

import javax.inject.Inject;
import javax.persistence.*;
import java.lang.reflect.InvocationTargetException;
import java.util.*;

@Entity
@NamedQueries({
        @NamedQuery(name = "balance", query = "select sum(e.debit)-sum(e.credit) " +
                "from Entry e join e.transaction t " +
                "where e.account.id IN :accountIds " +
                "and t.type = 'S'")
})
public class Account extends ConvertedEntity implements Cloneable, Comparable<Account> {

    @Inject
    static AccountService accountService;

    @ManyToOne(targetEntity = Instance.class)
    public Instance instance;
    @Column(length = 1)
    public String type;
    public String name;
    public String externalRef;
    @ManyToOne(targetEntity = Account.class)
    public Account parent;
    public Boolean colorRevert;
    public Boolean reconcilable;
    public String mongoId;

    @Transient
    public Boolean root;
    @Transient
    public List<Account> subAccounts;

    public Account() {}

    public Account(String json) {
        super(json);
    }

    public void setDefaults() {
        if (colorRevert == null) colorRevert = false;
        if (reconcilable == null) reconcilable = false;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Account)) return false;

        Account account = (Account) o;

        return Objects.equals(id, account.id);
    }

    @Override
    public int hashCode() {
        int result = id != null ? id.hashCode() : 0;
        return result;
    }

    public Long getId() {
        return id;
    }

    @Override
    public Account clone()  {
        Account clone= null;
        try {
            clone = (Account) super.clone();
        } catch (CloneNotSupportedException e) {
            throw new RuntimeException(e);
        }
        return clone;
    }

    @Override
    public int compareTo(Account o) {
        if (name == null && (o == null || o.name == null))
            return 0;
        if (name == null)   // l'autre nom est non-null (cf. au-dessus). Je mets les comptes sans nom en 1er
            return -1;
        // maintenant name != null
        if (o == null || o.name == null)
            return 1;
        return name.compareTo(o.name);
    }


}
