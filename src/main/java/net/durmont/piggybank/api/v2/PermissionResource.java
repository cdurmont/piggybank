package net.durmont.piggybank.api.v2;


import io.quarkus.hibernate.reactive.panache.Panache;
import io.quarkus.logging.Log;
import io.quarkus.panache.common.Page;
import io.quarkus.panache.common.Parameters;
import io.quarkus.panache.common.Sort;
import io.smallrye.mutiny.Uni;
import net.durmont.piggybank.model.Instance;
import net.durmont.piggybank.model.Permission;
import org.apache.commons.beanutils.BeanUtils;
import org.jboss.resteasy.reactive.RestPath;
import org.jboss.resteasy.reactive.RestQuery;

import javax.annotation.security.RolesAllowed;
import javax.ws.rs.*;
import javax.ws.rs.core.Response;
import java.lang.reflect.InvocationTargetException;
import java.net.URI;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Path("/api-v2/{instance}/permissions")
public class PermissionResource extends RestResource {

    @GET
    @RolesAllowed("user")
    public Uni<List<Permission>> read(@RestPath("instance") Long instance,
                                      @RestQuery("filter") Permission filter,
                                      @RestQuery("sort") List<String> sortQuery,
                                      @RestQuery("page") @DefaultValue("0") int pageIndex,
                                      @RestQuery("size") @DefaultValue("20") int pageSize) {

        return find(filter, buildSort(sortQuery), buildPage(pageIndex,pageSize));
    }


    private Uni<List<Permission>> find(Permission filter, Sort sort, Page page) {
        Map<String, Object> params = new HashMap<>();
        String query ="1=1";
        if (filter != null) {
            if (filter.type!= null) {
                query+=" AND type=:type";
                params.put("type", filter.type);
            }
            if (filter.user!= null) {
                query+=" AND user.id=:user_id";
                params.put("user_id", filter.user.id);
            }
            if (filter.account!= null) {
                query+=" AND account.id=:account_id";
                params.put("account_id", filter.account.id);
            }


        }
        return Permission.find(query, sort, params)
                .page(page)
                .list();

    }

    @POST
    @RolesAllowed("admin")
    public Uni<Response> create(@RestPath("instance") Long instance, Permission newPermission) {
        newPermission.instance = new Instance();
        newPermission.instance.id = instance;
        return Panache.<Permission>withTransaction(newPermission::persist)
                .onItem().ifNotNull().transform( inserted -> Response.created(URI.create("/api-v2/"+instance+"/permissions/"+inserted.id)).build() )
                .onItem().ifNull().continueWith(Response.ok().status(Response.Status.PRECONDITION_FAILED).build());
    }

    @Path("{id}")
    @PUT
    @RolesAllowed("admin")
    public Uni<Response> update(@RestPath("instance") Long instanceId, Long id, Permission perm) {

        return Panache.withTransaction(
                        ()-> Permission.<Permission>findById(id)
                                .map(permissionDb -> {
                                    // isolate instances
                                    if (Objects.equals(permissionDb.instance.id, instanceId)) {
                                        // no cheating ! Prevent malicious update of instance id
                                        perm.instance = permissionDb.instance;
                                        try {
                                            BeanUtils.copyProperties(permissionDb, perm);
                                        } catch (IllegalAccessException | InvocationTargetException e) {
                                            Log.error("Error copying new properties of Permission " + id, e);
                                        }
                                    }
                                    return permissionDb;
                                }))
                .onItem().ifNotNull().transform(permission -> Response.ok(permission).build())
                .onItem().ifNull().continueWith(Response.ok().status(Response.Status.NOT_FOUND).build());
    }


    @Path("{id}")
    @DELETE
    @RolesAllowed("admin")
    public Uni<Response> delete(@RestPath("instance") Long instanceId, Long id) {

        return Panache.withTransaction(() -> Permission.delete("instance.id=:instance_id and id=:id", Parameters.with("instance_id",instanceId).and("id",id)))
                .map(result -> result != null && result == 1L ?
                        Response.ok().status(Response.Status.NO_CONTENT).build() :
                        Response.ok().status(Response.Status.NOT_FOUND).build());
    }
}
