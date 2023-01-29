package net.durmont.piggybank.model;

import javax.persistence.Entity;
import javax.persistence.ManyToOne;

@Entity
public class PaymentMethod extends ConvertedEntity{

    @ManyToOne(targetEntity = Instance.class)
    public Instance instance;
    @ManyToOne(targetEntity = User.class)
    public User user;
    @ManyToOne(targetEntity = Account.class)
    public Account account;
    public String name;

    public PaymentMethod() {}
    public PaymentMethod(String json) { super(json);}

    @Override
    public void setDefaults() {
        if (instance == null)
            instance = new Instance(1L);
        if (name == null)
            name= "(sans nom)";
    }
}
