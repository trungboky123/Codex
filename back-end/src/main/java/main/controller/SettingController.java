package main.controller;

import lombok.RequiredArgsConstructor;
import main.dto.request.CreateSettingRequest;
import main.dto.request.UpdateSettingRequest;
import main.dto.response.SettingResponse;
import main.service.interfaces.ISettingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin("http://localhost:3000")
@RequiredArgsConstructor
@RequestMapping("/settings")
public class SettingController {
    private final ISettingService settingService;

    @GetMapping("/categories")
    public ResponseEntity<?> getAllCategories() {
        List<SettingResponse> categories = settingService.getAllCategories();
        return ResponseEntity.ok(categories);
    }

    @GetMapping("/roles")
    public ResponseEntity<?> getAllRoles() {
        List<SettingResponse> roles = settingService.getAllRoles();
        return ResponseEntity.ok(roles);
    }

    @GetMapping("/types")
    public ResponseEntity<?> getAllTypes() {
        List<SettingResponse> types = settingService.findAllTypes();
        return ResponseEntity.ok(types);
    }

    @GetMapping("/getAll")
    public ResponseEntity<?> getAllSettings(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer typeId,
            @RequestParam(required = false) Boolean status,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir
    ) {
        List<SettingResponse> settings = settingService.getAllSettings(keyword, typeId, status, sortBy, sortDir);
        return ResponseEntity.ok(settings);
    }

    @PutMapping("/status/{id}")
    public ResponseEntity<?> updateStatus(@PathVariable Integer id) {
        settingService.updateStatus(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/create")
    public ResponseEntity<?> addSetting(@RequestBody CreateSettingRequest request) {
        settingService.create(request);
        return ResponseEntity.ok(Map.of(
                "message", "Created Successfully!"
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getSettingById(@PathVariable Integer id) {
        SettingResponse response = settingService.findById(id);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/update/{id}")
    public ResponseEntity<?> updateSetting(@PathVariable Integer id, @RequestBody UpdateSettingRequest request) {
        settingService.updateSetting(id, request);
        return ResponseEntity.ok(Map.of(
                "message", "Updated Successfully!"
        ));
    }
}
