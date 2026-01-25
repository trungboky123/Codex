package main.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank(message = "Full name cannot be blank!")
    @Size(max = 50, message = "Maximum of full name is 50 characters!")
    private String fullName;

    @NotBlank(message = "Username cannot be blank!")
    @Size(max = 50, message = "Maximum of username is 50 characters!")
    private String username;

    @NotBlank(message = "Email cannot be blank!")
    @Size(max = 255, message = "Maximum of email is 255 characters!")
    @Email(message = "Email is invalid!")
    private String email;

    @NotBlank(message = "Password cannot be blank!")
    private String password;
}
