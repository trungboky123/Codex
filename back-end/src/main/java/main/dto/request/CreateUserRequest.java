package main.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateUserRequest {
    @Size(max = 50, message = "Maximum of full name is 50 characters!")
    private String fullName;

    @Size(max = 50, message = "Maximum of username is 50 characters!")
    private String username;

    @Size(max = 255, message = "Maximum of email is 255 characters!")
    @Email(message = "Email is invalid!")
    private String email;

    private String avatarUrl;

    @NotNull(message = "Role is required")
    private Integer roleId;
    private Boolean status;
}
