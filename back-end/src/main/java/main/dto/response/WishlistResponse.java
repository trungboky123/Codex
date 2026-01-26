package main.dto.response;

import lombok.Data;

@Data
public class WishlistResponse {
    private UserResponse user;
    private Integer itemId;
    private String type;
}
