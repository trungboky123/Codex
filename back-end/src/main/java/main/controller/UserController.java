package main.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import main.configuration.CustomUserDetails;
import main.dto.request.UpdateUserRequest;
import main.dto.response.UserResponse;
import main.service.interfaces.IUserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
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

    @PatchMapping(value = "/me", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateMe(Authentication authentication, @Valid @RequestPart(value = "data", required = false) UpdateUserRequest request, @RequestPart(value = "avatar", required = false) MultipartFile avatar) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Integer userId = userDetails.getId();

        userService.updateMe(userId, request, avatar);

        return ResponseEntity.ok(Map.of(
                "message", "Updated Successfully!"
        ));
    }

    @GetMapping("/total")
    public ResponseEntity<?> getTotalUsers() {
        Long count = userService.getTotalUsers();
        return ResponseEntity.ok(Map.of(
                "totalUsers", count
        ));
    }

    @GetMapping("/findAll")
    public ResponseEntity<?> getAllUsers(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer roleId,
            @RequestParam(required = false) Boolean status,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir
    ) {
        List<UserResponse> users = userService.getAllUsers(keyword, roleId, status, sortBy, sortDir);
        return ResponseEntity.ok(users);
    }

    @PutMapping("/status/{id}")
    public ResponseEntity<?> updateStatus(@PathVariable Integer id) {
        userService.updateStatus(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/instructors/getAll")
    public ResponseEntity<?> getAllInstructors() {
        List<UserResponse> instructors = userService.getAllInstructors();
        return ResponseEntity.ok(instructors);
    }
}
