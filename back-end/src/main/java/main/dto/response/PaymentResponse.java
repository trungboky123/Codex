package main.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class PaymentResponse {
    private String itemType;
    private Integer itemId;
    private String name;
    private String thumbnail;
    private BigDecimal amount;
    private String method;
    private String status;
    private LocalDateTime paidAt;
}
