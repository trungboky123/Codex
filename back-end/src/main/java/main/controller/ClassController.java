package main.controller;

import lombok.RequiredArgsConstructor;
import main.dto.response.ClassResponse;
import main.service.interfaces.IClassService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RequiredArgsConstructor
@RestController
@CrossOrigin("http://localhost:3000")
@RequestMapping("/classes")
public class ClassController {
    private final IClassService classService;

    @GetMapping("/public")
    public ResponseEntity<?> getPublicClasses(
            @PageableDefault(size = 12) Pageable pageable,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String sortByPrice,
            @RequestParam(required = false) String keyword
    ) {
        Page<ClassResponse> classes = classService.getPublicClasses(pageable, categoryId, sortByPrice, keyword);
        return ResponseEntity.ok(classes);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getClassById(@PathVariable Integer id) {
        ClassResponse clazz = classService.getClassById(id);
        return ResponseEntity.ok(clazz);
    }

    @GetMapping("/total")
    public ResponseEntity<?> getTotalCourses() {
        Long count = classService.getTotalClasses();
        return ResponseEntity.ok(Map.of(
                "totalClasses", count
        ));
    }

    @GetMapping("/admin/getAll")
    public ResponseEntity<?> getAllClasses(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer categoryId,
            @RequestParam(required = false) Integer instructorId,
            @RequestParam(required = false) Boolean status,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir
    ) {
        List<ClassResponse> classes = classService.getAllClasses(keyword, categoryId, instructorId, status, sortBy, sortDir);
        return ResponseEntity.ok(classes);
    }

    @PutMapping("/status/{id}")
    public ResponseEntity<?> updateStatus(@PathVariable Integer id) {
        classService.updateStatus(id);
        return ResponseEntity.ok().build();
    }
}
