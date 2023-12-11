package net.durmont.piggybank.model;



import javax.persistence.Entity;
import javax.persistence.Table;
import java.util.Objects;

@Entity
@Table(name = "PiggyUser")
public class User extends ConvertedEntity {

    public Boolean admin;
    public String login;
    public String name;
    public String mongoId;

    public User() {
    }

    public User(String json) {
        super(json);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        User user = (User) o;

        if (admin != user.admin) return false;
        if (!Objects.equals(login, user.login)) return false;
        if (!Objects.equals(name, user.name)) return false;
        return Objects.equals(mongoId, user.mongoId);
    }

    @Override
    public int hashCode() {
        int result = ((admin != null && admin == Boolean.TRUE) ? 1 : 0);
        result = 31 * result + (login != null ? login.hashCode() : 0);
        result = 31 * result + (name != null ? name.hashCode() : 0);
        result = 31 * result + (mongoId != null ? mongoId.hashCode() : 0);
        return result;
    }


    @Override
    public void setDefaults() {
        admin = false;
    }
}
