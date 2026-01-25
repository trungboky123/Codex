package main.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import main.configuration.CustomUserDetails;
import main.dto.request.UpdateUserRequest;
import main.dto.response.UserResponse;
import main.service.interfaces.IUserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@CrossOrigin("http://localhost:3000")
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {
    private final IUserService userService;

    @GetMapping("/me")
    public ResponseEntity<?> getMe(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

        UserResponse userResponse = new UserResponse();
        userResponse.setUsername(userDetails.getUsername());
        userResponse.setFullName(userDetails.getFullName());
        userResponse.setEmail(userDetails.getEmail());
        userResponse.setAvatarUrl(userDetails.getAvatarUrl());

        return ResponseEntity.ok(userResponse);
    }

    @PatchMapping("/me")
    public ResponseEntity<?> updateMe(Authentication authentication, @Valid @RequestBody UpdateUserRequest request) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Integer userId = userDetails.getId();

        userService.updateMe(userId, request);

        return ResponseEntity.ok(Map.of(
                "message", "Updated Successfully!"
        ));
    }
}
