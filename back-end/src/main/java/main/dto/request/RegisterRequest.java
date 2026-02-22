package main.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank(message = "fullName.notBlank")
    @Size(max = 50, message = "fullName.maximum")
    private String fullName;

    @NotBlank(message = "username.notBlank")
    @Size(max = 50, message = "username.maximum")
    private String username;

    @NotBlank(message = "email.notBlank")
    @Size(max = 255, message = "email.maximum")
    @Email(message = "email.invalid")
    private String email;

    @NotBlank(message = "password.notBlank")
    private String password;
}
