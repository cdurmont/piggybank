package net.durmont.piggybank.api.v2;


import io.quarkus.logging.Log;
import io.smallrye.mutiny.Uni;
import net.durmont.piggybank.service.QifService;
import org.jboss.resteasy.reactive.RestForm;
import org.jboss.resteasy.reactive.RestPath;
import org.jboss.resteasy.reactive.multipart.FileUpload;

import javax.annotation.security.RolesAllowed;
import javax.inject.Inject;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.core.Response;
import java.net.URI;

@Path("/api-v2/{instance}/imports")
public class ImportResource {

    @Inject
    QifService qifService;

    @Path("qif")
    @POST
    @RolesAllowed("user")
    public Uni<Response> qifImport(@RestPath("instance") Long instance,
                                   @RestForm Long accountId,
                                   @RestForm("qif") FileUpload qifFile) {

        Log.info("File received !" + qifFile.fileName() +" => "+accountId);

        return qifService.loadQif(instance, accountId, qifFile.uploadedFile().toFile())
                .map(transactions -> Response.created(URI.create("/api-v2/"+instance+"/imports/"+qifFile.fileName())).build());
    }

}
