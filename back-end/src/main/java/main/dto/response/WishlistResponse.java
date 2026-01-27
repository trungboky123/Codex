package main.dto.response;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class WishlistResponse {
    private Long id;
    private UserResponse user;
    private Integer itemId;
    private String itemName;
    private String type;
    private String listedPrice;
    private String salePrice;
    private String thumbnailUrl;
    private LocalDateTime addedAt;
}
