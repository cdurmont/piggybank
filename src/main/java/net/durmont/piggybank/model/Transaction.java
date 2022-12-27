package net.durmont.piggybank.model;

import com.fasterxml.jackson.annotation.JsonView;
import net.durmont.piggybank.Views;

import javax.persistence.*;
import java.time.LocalDate;
import java.util.List;
import java.util.Objects;

@Entity
public class Transaction extends ConvertedEntity{

    @JsonView(Views.Standard.class)
    @ManyToOne(targetEntity = Instance.class)
    public Instance instance;

    @JsonView(Views.Standard.class)
    public String description;
    @JsonView(Views.Standard.class)
    @Column(length = 1)
    public String type; // <S>imple, <R>ecurring, <I>mport, <Q>uick input
    @JsonView(Views.Standard.class)
    public Boolean balanced;
    @JsonView(Views.Standard.class)
    public Boolean reconciled;
    @JsonView(Views.Standard.class)
    public LocalDate recurStartDate;
    @JsonView(Views.Standard.class)
    public LocalDate recurEndDate;
    @JsonView(Views.Standard.class)
    public LocalDate recurNextDate;
    @JsonView(Views.Standard.class)
    @ManyToOne(targetEntity = User.class)
    public User owner;
    public String mongoId;
    @JsonView(Views.IncludeOneToMany.class)
    @OneToMany(targetEntity = Entry.class, mappedBy = "transaction", fetch = FetchType.LAZY)
    public List<Entry> entries;


    /**
     *
     */
    public Transaction() {
    }

    public Transaction(String json) {
        super(json);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Transaction)) return false;

        Transaction that = (Transaction) o;

        if (!Objects.equals(instance, that.instance)) return false;
        if (!Objects.equals(description, that.description)) return false;
        if (!Objects.equals(type, that.type)) return false;
        if (!Objects.equals(balanced, that.balanced)) return false;
        if (!Objects.equals(reconciled, that.reconciled)) return false;
        if (!Objects.equals(recurStartDate, that.recurStartDate))
            return false;
        if (!Objects.equals(recurEndDate, that.recurEndDate)) return false;
        if (!Objects.equals(recurNextDate, that.recurNextDate))
            return false;
        if (!Objects.equals(owner, that.owner)) return false;
        return Objects.equals(mongoId, that.mongoId);
    }

    @Override
    public int hashCode() {
        int result = instance != null ? instance.hashCode() : 0;
        result = 31 * result + (description != null ? description.hashCode() : 0);
        result = 31 * result + (type != null ? type.hashCode() : 0);
        result = 31 * result + (balanced != null ? balanced.hashCode() : 0);
        result = 31 * result + (reconciled != null ? reconciled.hashCode() : 0);
        result = 31 * result + (recurStartDate != null ? recurStartDate.hashCode() : 0);
        result = 31 * result + (recurEndDate != null ? recurEndDate.hashCode() : 0);
        result = 31 * result + (recurNextDate != null ? recurNextDate.hashCode() : 0);
        result = 31 * result + (owner != null ? owner.hashCode() : 0);
        result = 31 * result + (mongoId != null ? mongoId.hashCode() : 0);
        return result;
    }

    @Override
    public void setDefaults() {
        if (balanced == null) balanced = true;
        if (reconciled == null) reconciled = false;
        if (type == null) type = "S";
    }
}
