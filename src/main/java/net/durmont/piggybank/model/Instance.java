package net.durmont.piggybank.model;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import io.quarkus.logging.Log;

import javax.persistence.Entity;

@Entity
public class Instance extends PanacheEntity {

    public String name;

    public Instance() {}
    public Instance(Long id) {
        this.id = id;
    }

    public static Instance valueOf(String json) {
        Instance instance = null;
        try {
            instance = new ObjectMapper().readValue(json, Instance.class);
        } catch (JsonProcessingException e) {
            Log.warn("Could not convert to Account from JSON : "+json, e);
        }

        return instance;
    }
}
