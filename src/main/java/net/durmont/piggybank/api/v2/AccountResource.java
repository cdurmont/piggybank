package net.durmont.piggybank.api.v2;


import io.quarkus.panache.common.Sort;
import io.smallrye.mutiny.Uni;
import net.durmont.piggybank.model.Entry;
import net.durmont.piggybank.service.AccountService;
import net.durmont.piggybank.model.Account;
import org.jboss.resteasy.reactive.RestPath;
import org.jboss.resteasy.reactive.RestQuery;

import javax.annotation.security.RolesAllowed;
import javax.inject.Inject;
import javax.ws.rs.*;
import javax.ws.rs.core.Response;
import java.math.BigDecimal;
import java.net.URI;
import java.util.List;

@Path("/api-v2/{instance}/accounts")
public class AccountResource extends RestResource {

    @Inject
    AccountService accountService;

    @GET
    @RolesAllowed("user")
    public Uni<List<Account>> read( @RestPath("instance") Long instance,
                              @RestQuery("filter") Account filter,
                              @RestQuery("sort") List<String> sortQuery,
                              @RestQuery("page") @DefaultValue("0") int pageIndex,
                              @RestQuery("size") @DefaultValue("200") int pageSize) {

        Sort sort = buildSort(sortQuery);
        if (sort.getColumns().size() == 0)
            sort.and("name");
        return accountService.list(instance, filter, sort, buildPage(pageIndex, pageSize));
    }

    @Path("{id}/entries")
    @GET
    @RolesAllowed("user")
    public Uni<List<Entry>> readEntries(@RestPath("instance") Long instance,
                                        @RestPath("id") Long accountId,
                                        @RestQuery("showReconciled") @DefaultValue("true") boolean showReconciled,
                                        @RestQuery("page") @DefaultValue("0") int pageIndex,
                                        @RestQuery("size") @DefaultValue("20") int pageSize) {
        return accountService.getEntries(instance, accountId, showReconciled, buildPage(pageIndex, pageSize));
    }

    @Path("{id}")
    @GET
    @RolesAllowed("user")
    public Uni<Response> readOne(@RestPath("instance") Long instance,
                                @RestPath("id") Long id) {
        return accountService.findById(instance, id)
                .onItem().ifNotNull().transform(account -> Response.ok(account).status(Response.Status.OK).build())
                .onItem().ifNull().continueWith(() -> Response.ok().status(Response.Status.NOT_FOUND).build());
    }

    @Path("{id}/balance")
    @GET
    @RolesAllowed("user")
    public Uni<BigDecimal> balance(@RestPath("instance") Long instance, Long id) {
        return accountService.balance(instance,id);
    }

    @Path("tree")
    @GET
    @RolesAllowed("user")
    public Uni<List<Account>> readTree(@RestPath("instance") Long instance) {
        return accountService.getAccountTree(instance);
    }



    @POST
    @RolesAllowed("user")
    public Uni<Response> create(@RestPath("instance") Long instance, Account newAccount) {
        return accountService.create(instance, newAccount)
                .onItem().ifNotNull().transform( inserted -> Response.created(URI.create("/api-v2/"+instance+"/accounts/"+inserted.id)).build() )
                .onItem().ifNull().continueWith(Response.ok().status(Response.Status.PRECONDITION_FAILED).build());
    }

    @Path("{id}")
    @PUT
    @RolesAllowed("user")
    public Uni<Response> update(@RestPath("instance") Long instance, Long id, Account account) {
        return accountService.update(instance, id, account)
                .onItem().ifNotNull().transform(acc -> Response.ok(acc).build())
                .onItem().ifNull().continueWith(Response.ok().status(Response.Status.NOT_FOUND).build());
    }

    @Path("{id}")
    @DELETE
    @RolesAllowed("user")
    public Uni<Response> delete(@RestPath("instance") Long instance, Long id) {
        return accountService.delete(instance, id)
                .map(result -> result != null && result == 1L ?
                        Response.ok().status(Response.Status.NO_CONTENT).build() :
                        Response.ok().status(Response.Status.NOT_FOUND).build());
    }

}
