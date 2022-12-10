package net.durmont.piggybank.api.v2;

import io.quarkus.hibernate.reactive.rest.data.panache.PanacheEntityResource;
import io.quarkus.rest.data.panache.ResourceProperties;
import net.durmont.piggybank.model.Association;

@ResourceProperties(path = "/api-v2/associations")
public interface AssociationResource extends PanacheEntityResource<Association, Long> {
}
