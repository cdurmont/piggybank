package net.durmont.piggybank.model;

import javax.persistence.Entity;
import javax.persistence.ManyToOne;
import java.util.Objects;

@Entity
public class Association extends ConvertedEntity {

    public String regex;
    @ManyToOne(targetEntity = Account.class)
    public Account account;
    public String mongoId;

    public Association() {
    }

    public Association(String json) {
        super(json);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Association)) return false;

        Association that = (Association) o;

        if (!Objects.equals(regex, that.regex)) return false;
        if (!Objects.equals(account, that.account)) return false;
        return Objects.equals(mongoId, that.mongoId);
    }

    @Override
    public int hashCode() {
        int result = regex != null ? regex.hashCode() : 0;
        result = 31 * result + (account != null ? account.hashCode() : 0);
        result = 31 * result + (mongoId != null ? mongoId.hashCode() : 0);
        return result;
    }


    @Override
    public void setDefaults() {

    }
}
