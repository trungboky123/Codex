package main.dto.request;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class WishlistRequest {
    private Long id;
    private String type;
    private Integer itemId;
    private String itemName;
    private BigDecimal listedPrice;
    private BigDecimal salePrice;
    private LocalDateTime addedAt;
}
