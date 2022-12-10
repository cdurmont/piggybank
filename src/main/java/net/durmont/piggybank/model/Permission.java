package net.durmont.piggybank.model;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.quarkus.logging.Log;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.ManyToOne;
import java.util.Objects;
import java.util.Optional;

@Entity
public class Permission extends ConvertedEntity {

    @ManyToOne(targetEntity = Instance.class)
    public Instance instance;
    @ManyToOne(targetEntity = User.class )
    public User user;
    @ManyToOne(targetEntity = Account.class)
    public Account account;
    @Column(length = 1)
    public String type;
    public String mongoId;

    public Permission() {
    }

    public Permission(String json) {
        super(json);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Permission)) return false;

        Permission that = (Permission) o;

        if (!Objects.equals(user, that.user)) return false;
        if (!Objects.equals(account, that.account)) return false;
        if (!Objects.equals(type, that.type)) return false;
        return Objects.equals(mongoId, that.mongoId);
    }

    @Override
    public int hashCode() {
        int result = user != null ? user.hashCode() : 0;
        result = 31 * result + (account != null ? account.hashCode() : 0);
        result = 31 * result + (type != null ? type.hashCode() : 0);
        result = 31 * result + (mongoId != null ? mongoId.hashCode() : 0);
        return result;
    }


    @Override
    public void setDefaults() {

    }

}
