package main.controller;

import lombok.RequiredArgsConstructor;
import main.configuration.CustomUserDetails;
import main.dto.response.ClassEnrollmentResponse;
import main.dto.response.CourseEnrollmentResponse;
import main.dto.response.MonthlyRevenueResponse;
import main.entity.Course;
import main.repository.CourseRepository;
import main.service.interfaces.IClassEnrollmentService;
import main.service.interfaces.ICourseEnrollmentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
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

    @GetMapping("/monthly-revenue")
    public ResponseEntity<?> getMonthlyRevenue() {
        Map<Integer, BigDecimal> revenueMap = new HashMap<>();
        for (int i = 1; i <= 12; i++) {
            revenueMap.put(i, BigDecimal.ZERO);
        }

        for (MonthlyRevenueResponse revenue : courseEnrollmentService.getMonthlyRevenue()) {
            revenueMap.put(revenue.getMonth(), revenueMap.get(revenue.getMonth()).add(revenue.getTotalRevenue()));
        }

        for (MonthlyRevenueResponse revenue : classEnrollmentService.getMonthlyRevenue()) {
            revenueMap.put(revenue.getMonth(), revenueMap.get(revenue.getMonth()).add(revenue.getTotalRevenue()));
        }

        List<MonthlyRevenueResponse> totalRevenue = new ArrayList<>();
        for (int i = 1; i <= 12; i++) {
            totalRevenue.add(new MonthlyRevenueResponse(i, revenueMap.get(i)));
        }

        return ResponseEntity.ok(totalRevenue);
    }

    @GetMapping("/check/course/{id}")
    public ResponseEntity<?> checkCourseEnrollment(Authentication authentication, @PathVariable Integer id) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        if (courseEnrollmentService.hasEnrolled(id, userDetails.getId())) {
            return ResponseEntity.ok(Map.of(
                    "status", "ENROLLED"
            ));
        }
        return ResponseEntity.ok(Map.of(
                "status", "NOT ENROLLED"
        ));
    }

    @GetMapping("/check/class/{id}")
    public ResponseEntity<?> checkClassEnrollment(Authentication authentication, @PathVariable Integer id) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        if (classEnrollmentService.hasEnrolled(id, userDetails.getId())) {
            return ResponseEntity.ok(Map.of(
                    "status", "ENROLLED"
            ));
        }
        return ResponseEntity.ok(Map.of(
                "status", "NOT ENROLLED"
        ));
    }

    @PostMapping("/free-course/{id}")
    public ResponseEntity<?> enrollFreeCourse(Authentication authentication, @PathVariable Integer id) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        courseEnrollmentService.enrollFreeCourse(userDetails.getId(), id);
        return ResponseEntity.ok().build();
    }
}
