package main.dto.request;

import lombok.Data;

@Data
public class PaymentRequest {
    private Integer itemId;
    private String itemType;
    private Long amount;
}
