package main.dto.response;

import lombok.Data;

@Data
public class UserResponse {
    private String fullName;
    private String username;
    private String email;
    private String avatarUrl;
}
