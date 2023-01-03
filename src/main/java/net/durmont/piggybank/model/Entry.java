package net.durmont.piggybank.model;

import javax.persistence.*;
import java.math.BigDecimal;
import java.util.Date;
import java.util.Objects;

@Entity
public class Entry extends ConvertedEntity implements Cloneable{

    @ManyToOne(targetEntity = Instance.class)
    public Instance instance;

    @Temporal(TemporalType.TIMESTAMP)
    public Date date;
    @ManyToOne(targetEntity = Account.class)
    public Account account;
    @ManyToOne(targetEntity = Transaction.class)
    public Transaction transaction;
    @Column(precision = 12, scale = 2)
    public BigDecimal debit;
    public BigDecimal credit;
    public String reference;
    public String description;
    public String mongoId;
    @Transient
    public BigDecimal balance;

    public Entry() {
    }

    public Entry(String json) {
        super(json);
    }

    /**
     * Acts as a custom clone
     * @param e Entry to copy
     */
    public Entry(Entry e) {
        instance = e.instance;
        date = e.date;
        account = e.account;
        transaction = e.transaction;
        debit = e.debit;
        credit = e.credit;
        reference = e.reference;
        description =e.description;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Entry)) return false;

        Entry entry = (Entry) o;

        if (!Objects.equals(date, entry.date)) return false;
        if (!Objects.equals(account, entry.account)) return false;
        if (!Objects.equals(transaction, entry.transaction)) return false;
        if (!Objects.equals(debit, entry.debit)) return false;
        if (!Objects.equals(credit, entry.credit)) return false;
        if (!Objects.equals(reference, entry.reference)) return false;
        if (!Objects.equals(description, entry.description)) return false;
        return Objects.equals(mongoId, entry.mongoId);
    }

    @Override
    public int hashCode() {
        int result = date != null ? date.hashCode() : 0;
        result = 31 * result + (account != null ? account.hashCode() : 0);
        result = 31 * result + (transaction != null ? transaction.hashCode() : 0);
        result = 31 * result + (debit != null ? debit.hashCode() : 0);
        result = 31 * result + (credit != null ? credit.hashCode() : 0);
        result = 31 * result + (reference != null ? reference.hashCode() : 0);
        result = 31 * result + (description != null ? description.hashCode() : 0);
        result = 31 * result + (mongoId != null ? mongoId.hashCode() : 0);
        return result;
    }


    @Override
    public void setDefaults() {

    }

    public BigDecimal balance(BigDecimal previousValue) {
        balance = previousValue != null ? previousValue : BigDecimal.ZERO;
        if (debit != null)
            balance = balance.add(debit);
        if (credit != null)
            balance = balance.subtract(credit);

        return balance;
    }

    @Override
    protected Entry clone() throws CloneNotSupportedException {
        Entry clone = (Entry) super.clone();
        clone.id = null;
        clone.date = new Date();
        return clone;
    }
}
