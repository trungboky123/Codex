package main.controller;

import lombok.RequiredArgsConstructor;
import main.dto.response.CourseResponse;
import main.service.interfaces.ICourseService;
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
@RequestMapping("/courses")
public class CourseController {
    private final ICourseService courseService;

    @GetMapping("/highlighted")
    public ResponseEntity<?> getHighlightedCourses() {
        List<CourseResponse> highlightedCourses = courseService.getHighlightedCourses();
        return ResponseEntity.ok(highlightedCourses);
    }

    @GetMapping("/public")
    public ResponseEntity<?> getPublicCourses(
            @PageableDefault(size = 12) Pageable pageable,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String sortByPrice,
            @RequestParam(required = false) String keyword
    ) {
        Page<CourseResponse> courses = courseService.getPublicCourses(pageable, categoryId, sortByPrice, keyword);
        return ResponseEntity.ok(courses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getCourseById(@PathVariable Integer id) {
        CourseResponse course = courseService.getCourseById(id);
        return ResponseEntity.ok(course);
    }

    @GetMapping("/total")
    public ResponseEntity<?> getTotalCourses() {
        Long count = courseService.getTotalCourses();
        return ResponseEntity.ok(Map.of(
                "totalCourses", count
        ));
    }

    @GetMapping("/admin/getAll")
    public ResponseEntity<?> getAllCourses(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer categoryId,
            @RequestParam(required = false) Integer instructorId,
            @RequestParam(required = false) Boolean status,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir
    ) {
        List<CourseResponse> courses = courseService.getAllCourses(keyword, categoryId, instructorId, status, sortBy, sortDir);
        return ResponseEntity.ok(courses);
    }

    @PutMapping("/status/{id}")
    public ResponseEntity<?> updateStatus(@PathVariable Integer id) {
        courseService.updateStatus(id);
        return ResponseEntity.ok().build();
    }
}
