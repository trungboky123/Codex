package main.dto.request;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class WishlistRequest {
    private String type;
    private Integer itemId;
    private String itemName;
    private BigDecimal listedPrice;
    private BigDecimal salePrice;
    private String thumbnailUrl;
}
