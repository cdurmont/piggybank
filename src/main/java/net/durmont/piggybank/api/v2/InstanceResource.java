package net.durmont.piggybank.api.v2;

import io.quarkus.hibernate.reactive.panache.Panache;
import io.quarkus.logging.Log;
import io.quarkus.rest.data.panache.ResourceProperties;
import io.smallrye.mutiny.Uni;
import net.durmont.piggybank.model.Instance;
import org.apache.commons.beanutils.BeanUtils;
import org.jboss.resteasy.reactive.RestPath;
import org.jboss.resteasy.reactive.RestQuery;

import javax.annotation.security.RolesAllowed;
import javax.ws.rs.*;
import javax.ws.rs.core.Response;
import java.lang.reflect.InvocationTargetException;
import java.net.URI;
import java.util.List;

@ResourceProperties(path = "/api-v2/instances")
public class InstanceResource extends RestResource {

    @GET
    @RolesAllowed("admin")
    public Uni<List<Instance>> read(@RestQuery("filter") Instance filter,
                                   @RestQuery("sort") List<String> sortQuery,
                                   @RestQuery("page") @DefaultValue("0") int pageIndex,
                                   @RestQuery("size") @DefaultValue("20") int pageSize) {

        return Instance.findAll(buildSort(sortQuery)).page(buildPage(pageIndex,pageSize)).list();
    }



    @Path("{id}")
    @GET
    @RolesAllowed("admin")
    public Uni<Response> readOne(@RestPath("id") Long id) {

        return Instance.findById(id)
                .onItem().ifNotNull().transform(instance -> Response.ok(instance).status(Response.Status.OK).build())
                .onItem().ifNull().continueWith(() -> Response.ok().status(Response.Status.NOT_FOUND).build());
    }

    @POST
    @RolesAllowed("admin")
    public Uni<Response> create(Instance newInstance) {

        return newInstance.<Instance>persist()
                .onItem().ifNotNull().transform( inserted -> Response.created(URI.create("/api-v2/instance/"+inserted.id)).build() )
                .onItem().ifNull().continueWith(Response.ok().status(Response.Status.PRECONDITION_FAILED).build());
    }

    @Path("{id}")
    @PUT
    @RolesAllowed("admin")
    public Uni<Response> update(Long id, Instance instance) {

        return Panache.withTransaction(
                ()-> Instance.<Instance>findById(id)
                        .map(instanceDb -> {
                            try {
                                BeanUtils.copyProperties(instanceDb, instance);
                            } catch (IllegalAccessException | InvocationTargetException e) {
                                Log.error("Error copying new properties of Instance "+id, e);
                            }
                            return instanceDb;
                        }))
                .onItem().ifNotNull().transform(inst -> Response.ok(inst).build())
                .onItem().ifNull().continueWith(Response.ok().status(Response.Status.NOT_FOUND).build());
    }

    @Path("{id}")
    @DELETE
    @RolesAllowed("admin")
    public Uni<Response> delete(Long id) {

        return Panache.withTransaction(() -> Instance.deleteById(id))
                .map(result -> Boolean.TRUE.equals(result) ?
                        Response.ok().status(Response.Status.NO_CONTENT).build() :
                        Response.ok().status(Response.Status.NOT_FOUND).build());
    }

}
