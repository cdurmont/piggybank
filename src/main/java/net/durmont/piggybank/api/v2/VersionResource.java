package net.durmont.piggybank.api.v2;

import net.durmont.piggybank.model.Version;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

@Path("/api-v2/version")
public class VersionResource {

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Version Version() {
        return new Version("v2.0.1");
    }
}
