package main.dto.response;

import lombok.Data;
import java.io.Serializable;

@Data
public class UserResponse implements Serializable {
    private Integer id;
    private String fullName;
    private String username;
    private String email;
    private SettingResponse role;
    private boolean status;
    private String avatarUrl;
}
