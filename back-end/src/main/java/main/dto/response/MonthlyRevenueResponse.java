package main.dto.response;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class MonthlyRevenueResponse {
    Integer month;
    BigDecimal totalRevenue;

    public MonthlyRevenueResponse(Integer month, BigDecimal totalRevenue) {
        this.month = month;
        this.totalRevenue = totalRevenue;
    }
}
