package main.dto.response;

import lombok.Data;

@Data
public class UserResponse {
    private Integer id;
    private String fullName;
    private String username;
    private String email;
    private SettingResponse role;
    private boolean status;
    private String avatarUrl;
}
