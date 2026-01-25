package main.controller;

import lombok.RequiredArgsConstructor;
import main.dto.response.ClassResponse;
import main.service.interfaces.IClassService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RestController
@CrossOrigin("http://localhost:3000")
@RequestMapping("/classes")
public class ClassController {
    private final IClassService classService;

    @GetMapping("/public")
    public ResponseEntity<?> getAllClasses(
            @PageableDefault(size = 12) Pageable pageable,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String sortByPrice,
            @RequestParam(required = false) String keyword
    ) {
        Page<ClassResponse> classes = classService.getAllClasses(pageable, categoryId, sortByPrice, keyword);
        return ResponseEntity.ok(classes);
    }
}
