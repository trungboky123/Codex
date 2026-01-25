package main.controller;

import lombok.RequiredArgsConstructor;
import main.dto.response.SettingResponse;
import main.service.interfaces.ISettingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

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
}
