package net.durmont.piggybank.model;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import io.quarkus.logging.Log;
import org.apache.commons.beanutils.BeanUtils;

import java.lang.reflect.InvocationTargetException;


public abstract class ConvertedEntity extends PanacheEntity {

    public abstract void setDefaults();

    public ConvertedEntity() {}

    public ConvertedEntity(String json) {
        try {
            ConvertedEntity entity = new ObjectMapper().readValue(json, getClass());
            BeanUtils.copyProperties(this, entity);

        } catch (JsonProcessingException | InvocationTargetException | IllegalAccessException e) {
            Log.warn("Could not convert to "+getClass().getCanonicalName()+" from JSON : "+json, e);
        }
    }

}
