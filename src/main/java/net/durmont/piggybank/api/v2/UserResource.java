package net.durmont.piggybank.api.v2;

import io.quarkus.hibernate.reactive.panache.Panache;
import io.quarkus.logging.Log;
import io.quarkus.panache.common.Page;
import io.quarkus.panache.common.Sort;
import io.smallrye.mutiny.Uni;
import net.durmont.piggybank.model.User;
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

@Path("/api-v2/users")
public class UserResource extends RestResource {

    @GET
    @RolesAllowed("user")
    public Uni<List<User>> read(@RestQuery("filter") User filter,
                                    @RestQuery("sort") List<String> sortQuery,
                                    @RestQuery("page") @DefaultValue("0") int pageIndex,
                                    @RestQuery("size") @DefaultValue("20") int pageSize) {

        return find(filter, buildSort(sortQuery), buildPage(pageIndex,pageSize));
    }



    @Path("{id}")
    @GET
    @RolesAllowed("user")
    public Uni<Response> readOne(@RestPath("id") Long id) {

        return User.findById(id)
                .onItem().ifNotNull().transform(user -> Response.ok(user).status(Response.Status.OK).build())
                .onItem().ifNull().continueWith(() -> Response.ok().status(Response.Status.NOT_FOUND).build());
    }

    @POST
    @RolesAllowed("user")
    public Uni<Response> create(User newUser) {

        return Panache.<User>withTransaction(newUser::persist)
                .onItem().ifNotNull().transform( inserted -> Response.created(URI.create("/api-v2/users/"+inserted.id)).build() )
                .onItem().ifNull().continueWith(Response.ok().status(Response.Status.PRECONDITION_FAILED).build());
    }

    @Path("{id}")
    @PUT
    @RolesAllowed("user")
    public Uni<Response> update(Long id, User user) {

        return Panache.withTransaction(
                        ()-> User.<User>findById(id)
                                .map(instanceDb -> {
                                    try {
                                        BeanUtils.copyProperties(instanceDb, user);
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
    @RolesAllowed("user")
    public Uni<Response> delete(Long id) {

        return Panache.withTransaction(() -> User.deleteById(id))
                .map(result -> Boolean.TRUE.equals(result) ?
                        Response.ok().status(Response.Status.NO_CONTENT).build() :
                        Response.ok().status(Response.Status.NOT_FOUND).build());
    }

    private Uni<List<User>> find(User filter, Sort sort, Page page) {
        Map<String, Object> params = new HashMap<>();
        String query ="1=1";
        if (filter != null) {
            if (filter.admin!= null) {
                query+=" AND admin=:admin";
                params.put("admin", filter.admin);
            }
            if (filter.login!= null) {
                query+=" AND login=:login";
                params.put("login", filter.login);
            }
            if (filter.name != null) {
                query+=" AND name=:name";
                params.put("name", filter.name);
            }

        }
        return User.find(query, sort, params)
                .page(page)
                .list();

    }
}
