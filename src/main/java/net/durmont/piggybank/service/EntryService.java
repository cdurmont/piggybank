package net.durmont.piggybank.service;

import io.quarkus.hibernate.reactive.panache.Panache;
import io.quarkus.logging.Log;
import io.quarkus.panache.common.Page;
import io.quarkus.panache.common.Parameters;
import io.quarkus.panache.common.Sort;
import io.smallrye.mutiny.Uni;
import net.durmont.piggybank.model.Entry;
import net.durmont.piggybank.model.Instance;
import org.apache.commons.beanutils.BeanUtils;

import javax.enterprise.context.ApplicationScoped;
import java.lang.reflect.InvocationTargetException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@ApplicationScoped
public class EntryService {

    public Uni<Entry> create(Long instanceId, Entry newEntry) {
        newEntry.setDefaults();
        if (newEntry.instance == null)
            newEntry.instance = new Instance();
        newEntry.instance.id = instanceId;
        return Panache.withTransaction(newEntry::persist);
    }

    public Uni<List<Entry>> list(Long instanceId, Entry filter, Sort sort, Page page) {
        Map<String, Object> params = new HashMap<>();
        String query ="1=1";
        query+=" AND instance.id=:instance_id";
        params.put("instance_id", instanceId);
        if (filter != null) {

        }
        return Entry.find(query, sort, params)
                .page(page)
                .list();
    }

    public Uni<Entry> findById(Long instanceId, Long id) {
        // will return the transaction UNLESS it is not from the given instance
        return Entry.<Entry>findById(id)
                .map(entry -> entry != null && entry.instance != null && Objects.equals(instanceId, entry.instance.id) ? entry : null);
    }

    public Uni<Entry> update(Long instanceId, Long id, Entry entry) {
        entry.id=id;
        entry.setDefaults();
        return Panache.withTransaction(
                ()-> Entry.<Entry>findById(id)
                        .map(entryDb -> {
                            if (entryDb != null && entryDb.instance != null && !Objects.equals(instanceId, entryDb.instance.id))
                                return null;
                            entry.instance = entryDb.instance;
                            try {
                                BeanUtils.copyProperties(entryDb, entry);
                            } catch (IllegalAccessException | InvocationTargetException e) {
                                Log.error("Error copying new properties of Entry "+id, e);
                            }
                            return entryDb;
                        })
        );
    }

    public Uni<Long> delete(Long instanceId, Long id) {
        return Panache.withTransaction(() ->
                Entry.delete("instance.id=:instance_id and id=:id", Parameters.with("instance_id",instanceId).and("id",id)));
    }
}
