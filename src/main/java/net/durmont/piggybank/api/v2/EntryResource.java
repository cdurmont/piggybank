package net.durmont.piggybank.api.v2;

import io.quarkus.hibernate.reactive.rest.data.panache.PanacheEntityResource;
import io.quarkus.rest.data.panache.ResourceProperties;
import io.smallrye.mutiny.Uni;
import net.durmont.piggybank.model.Entry;
import net.durmont.piggybank.model.Instance;
import net.durmont.piggybank.model.Transaction;
import net.durmont.piggybank.service.EntryService;
import org.jboss.resteasy.reactive.RestPath;

import javax.annotation.security.RolesAllowed;
import javax.inject.Inject;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.core.Response;
import java.net.URI;

@Path("/api-v2/{instance}/entries")
public class EntryResource extends RestResource {

    @Inject
    EntryService entryService;

    @POST
    @RolesAllowed("user")
    public Uni<Response> create(@RestPath("instance") Long instance, Entry newEntry) {
        newEntry.instance = new Instance();
        newEntry.instance.id = instance;
        return entryService.create(instance, newEntry)
                .onItem().ifNotNull().transform( inserted -> Response.created(URI.create("/api-v2/"+instance+"/entries/"+inserted.id)).build() )
                .onItem().ifNull().continueWith(Response.ok().status(Response.Status.PRECONDITION_FAILED).build());
    }

}
