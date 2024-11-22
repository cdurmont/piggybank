package net.durmont.piggybank.api.v2;

import io.quarkus.hibernate.reactive.panache.Panache;
import io.quarkus.logging.Log;
import io.quarkus.rest.data.panache.ResourceProperties;
import io.smallrye.mutiny.Uni;
import net.durmont.piggybank.model.Instance;
import net.durmont.piggybank.service.InstanceService;
import org.apache.commons.beanutils.BeanUtils;
import org.jboss.resteasy.reactive.RestPath;
import org.jboss.resteasy.reactive.RestQuery;

import javax.annotation.security.RolesAllowed;
import javax.inject.Inject;
import javax.ws.rs.*;
import javax.ws.rs.core.Response;
import java.lang.reflect.InvocationTargetException;
import java.net.URI;
import java.util.List;

@Path("/api-v2/instances")
public class InstanceResource extends RestResource {

    @Inject
    private InstanceService instanceService;

    @GET
    @RolesAllowed("user")
    public Uni<List<Instance>> read(@RestQuery("filter") Instance filter,
                                   @RestQuery("sort") List<String> sortQuery,
                                   @RestQuery("page") @DefaultValue("0") int pageIndex,
                                   @RestQuery("size") @DefaultValue("20") int pageSize) {

        return instanceService.read(filter, buildSort(sortQuery), buildPage(pageSize, pageIndex));
    }



    @Path("{id}")
    @GET
    @RolesAllowed("user")
    public Uni<Response> readOne(@RestPath("id") Long id) {

        return instanceService.readOne(id)
                .onItem().ifNotNull().transform(instance -> Response.ok(instance).build())
                .onItem().ifNull().continueWith(() -> Response.status(Response.Status.NOT_FOUND).build());
    }

    @POST
    @RolesAllowed("user")
    public Uni<Response> create(Instance newInstance) {

        return instanceService.create(newInstance)
                .onItem().ifNotNull().transform( inserted -> Response.created(URI.create("/api-v2/instance/"+((Instance)inserted).id)).entity(inserted).build() )
                .onItem().ifNull().continueWith(Response.status(Response.Status.PRECONDITION_FAILED).build());
    }


    @Path("{id}")
    @PUT
    @RolesAllowed("admin")
    public Uni<Response> update(Long id, Instance instance) {
        //TODO route should be decommissioned unless we want a real PUT route
        return instanceService.patch(id, instance)
                .onItem().ifNotNull().transform(inst -> Response.ok(inst).build())
                .onItem().ifNull().continueWith(Response.ok().status(Response.Status.NOT_FOUND).build());
    }

    @Path("{id}")
    @PATCH
    @RolesAllowed("admin")
    public Uni<Response> updatePatch(Long id, Instance instance) {
        return instanceService.patch(id, instance)
                .onItem().ifNotNull().transform(inst -> Response.ok(inst).build())
                .onItem().ifNull().continueWith(Response.ok().status(Response.Status.NOT_FOUND).build());
    }

    @Path("{id}")
    @DELETE
    @RolesAllowed("admin")
    public Uni<Response> delete(Long id) {

        return instanceService.delete(id)
                .map(result -> Boolean.TRUE.equals(result) ?
                        Response.ok().status(Response.Status.NO_CONTENT).build() :
                        Response.ok().status(Response.Status.NOT_FOUND).build());
    }

}
