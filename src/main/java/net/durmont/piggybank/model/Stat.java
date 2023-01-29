package net.durmont.piggybank.model;

import java.math.BigDecimal;

public class Stat {

    public int year;
    public int month;
    public BigDecimal debit;
    public BigDecimal credit;

    public Stat(int year, int month, BigDecimal debit, BigDecimal credit) {
        this.year = year;
        this.month = month;
        this.debit = debit;
        this.credit = credit;
    }
}
