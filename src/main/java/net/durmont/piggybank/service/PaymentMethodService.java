package net.durmont.piggybank.service;

import io.quarkus.hibernate.reactive.panache.Panache;
import io.quarkus.logging.Log;
import io.quarkus.panache.common.Parameters;
import io.smallrye.mutiny.Uni;
import net.durmont.piggybank.model.PaymentMethod;
import org.apache.commons.beanutils.BeanUtils;

import javax.enterprise.context.ApplicationScoped;
import java.lang.reflect.InvocationTargetException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@ApplicationScoped
public class PaymentMethodService {

    public Uni<PaymentMethod> create(Long instanceId, PaymentMethod newPM) {
        newPM.setDefaults();
        newPM.instance.id = instanceId;
        return Panache.withTransaction(newPM::persist);
    }

    public Uni<PaymentMethod> findById(Long instanceId, Long id) {
        return PaymentMethod.<PaymentMethod>findById(id)
                .map(pm -> pm != null && pm.instance != null && Objects.equals(instanceId, pm.instance.id) ? pm : null);
    }

    public Uni<List<PaymentMethod>> list(Long instanceId, PaymentMethod filter) {
        Map<String, Object> params = new HashMap<>();
        String query ="1=1";
        query+=" AND instance.id=:instance_id";
        params.put("instance_id", instanceId);
        if (filter != null) {
            if (filter.id!= null) {
                query+=" AND id=:id";
                params.put("id", filter.id);
            }
            if (filter.user!= null) {
                query+=" AND user=:user";
                params.put("user", filter.user);
            }
            if (filter.account!= null) {
                query+=" AND account=:account";
                params.put("account", filter.account);
            }
            if (filter.name!= null) {
                query+=" AND name=:name";
                params.put("name", filter.name);
            }
        }
        return PaymentMethod.find(query, params).list();
    }

    public Uni<PaymentMethod> update(Long instanceId, Long id, PaymentMethod pm) {
        pm.id = id;
        pm.setDefaults();
        return Panache.withTransaction(() -> findById(instanceId, id)
                .map(pmDb -> {
                    pm.instance = pmDb.instance;
                    try {
                        BeanUtils.copyProperties(pmDb, pm);
                    } catch (IllegalAccessException|InvocationTargetException e) {
                        Log.error("Error copying new properties of PaymentMethod "+id, e);
                    }
                    return pmDb;
                }));
    }

    public Uni<Long> delete(Long instanceId, Long id) {
        return Panache.withTransaction(() -> PaymentMethod.delete("instance.id=:instance_id and id=:id", Parameters.with("instance_id",instanceId).and("id",id)));
    }
}
