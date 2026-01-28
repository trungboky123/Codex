package main.controller;

import lombok.RequiredArgsConstructor;
import main.dto.response.ClassEnrollmentResponse;
import main.dto.response.CourseEnrollmentResponse;
import main.service.interfaces.IClassEnrollmentService;
import main.service.interfaces.ICourseEnrollmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RequiredArgsConstructor
@RestController
@CrossOrigin("http://localhost:3000")
@RequestMapping("/enrollments")
public class EnrollmentController {
    private final ICourseEnrollmentService courseEnrollmentService;
    private final IClassEnrollmentService classEnrollmentService;

    @GetMapping("/total-revenue")
    public ResponseEntity<?> getTotalRevenue() {
        BigDecimal courseRevenue = courseEnrollmentService.getTotalPrice();
        BigDecimal classRevenue = classEnrollmentService.getTotalPrice();
        return ResponseEntity.ok(Map.of(
                "totalRevenue", courseRevenue.add(classRevenue)
        ));
    }

    @GetMapping("/top-courses")
    public ResponseEntity<?> getTopSoldCourses() {
        List<CourseEnrollmentResponse> courses = courseEnrollmentService.getTopSoldCourses();
        return ResponseEntity.ok(courses);
    }

    @GetMapping("/top-classes")
    public ResponseEntity<?> getTopSoldClasses() {
        List<ClassEnrollmentResponse> classes = classEnrollmentService.getTopSoldClasses();
        return ResponseEntity.ok(classes);
    }
}
