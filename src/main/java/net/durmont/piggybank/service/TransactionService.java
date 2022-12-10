package net.durmont.piggybank.service;

import io.quarkus.hibernate.reactive.panache.Panache;
import io.quarkus.logging.Log;
import io.quarkus.panache.common.Page;
import io.quarkus.panache.common.Parameters;
import io.quarkus.panache.common.Sort;
import io.smallrye.mutiny.Uni;
import net.durmont.piggybank.model.Instance;
import net.durmont.piggybank.model.Transaction;
import org.apache.commons.beanutils.BeanUtils;

import javax.enterprise.context.ApplicationScoped;
import java.lang.reflect.InvocationTargetException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@ApplicationScoped
public class TransactionService {

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
        return Transaction.<Transaction>findById(id)
                .map(txn -> txn != null && txn.instance != null && Objects.equals(instanceId, txn.instance.id) ? txn : null);
    }

    public Uni<Transaction> update(Long instanceId, Long id, Transaction txn) {
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
        return Panache.withTransaction(() ->
                Transaction.delete("instance.id=:instance_id and id=:id", Parameters.with("instance_id",instanceId).and("id",id)));
    }
}
