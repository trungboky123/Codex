package main.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import main.configuration.CustomUserDetails;
import main.dto.request.CreateUserRequest;
import main.dto.request.UpdateUserRequest;
import main.dto.response.ImportResponse;
import main.dto.response.UserResponse;
import main.service.interfaces.IUserService;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
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

    @GetMapping("/get/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Integer id) {
        UserResponse user = userService.getUserById(id);
        return ResponseEntity.ok(user);
    }

    @PatchMapping(value = "/update/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateUser(@PathVariable Integer id, @Valid @RequestPart(value = "data", required = false) UpdateUserRequest request, @RequestPart(value = "avatar", required = false) MultipartFile avatar) {
        userService.updateUser(id, request, avatar);
        return ResponseEntity.ok(Map.of(
                "message", "Updated Successfully!"
        ));
    }

    @PostMapping(value = "/create", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createUser(@Valid @RequestPart(value = "data", required = false) CreateUserRequest request, @RequestPart(value = "avatar", required = false) MultipartFile avatar) {
        userService.createUser(request, avatar);
        return ResponseEntity.ok(Map.of(
                "message", "Created Successfully!"
        ));
    }

    @GetMapping("/download-template")
    public ResponseEntity<?> downloadTemplate() throws IOException {
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Accounts");

        // Headers style
        CellStyle headerStyle = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        headerStyle.setFont(font);

        // Header row
        Row header = sheet.createRow(0);

        String[] headers = {"fullName", "username", "email", "role", "password", "status"};
        for(int i = 0; i < headers.length; i++) {
            Cell cell = header.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
            sheet.autoSizeColumn(i);
        }

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        workbook.write(outputStream);
        workbook.close();

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=account_template.xlsx")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(outputStream.toByteArray());
    }

    @PostMapping(value = "/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> importAccounts(@RequestParam("file") MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "File is empty!"
            ));
        }

        ImportResponse response = userService.importAccounts(file);
        return ResponseEntity.ok(response);
    }
}
