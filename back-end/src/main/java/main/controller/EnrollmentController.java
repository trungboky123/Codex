package main.controller;

import lombok.RequiredArgsConstructor;
import main.configuration.CustomUserDetails;
import main.dto.response.*;
import main.entity.ClassEnrollment;
import main.entity.CourseEnrollment;
import main.entity.User;
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

    @GetMapping("/user")
    public ResponseEntity<?> findByUserId(
            Authentication authentication,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir
    ) {
        List<EnrollmentResponse> enrollments = new ArrayList<>();
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        List<EnrollmentResponse> courseEnrollments = courseEnrollmentService.findByUserId(userDetails.getId(), keyword, sortBy, sortDir);
        List<EnrollmentResponse> classEnrollments = classEnrollmentService.findByUserId(userDetails.getId(), keyword, sortBy, sortDir);

        enrollments.addAll(courseEnrollments);
        enrollments.addAll(classEnrollments);
        return ResponseEntity.ok(enrollments);
    }

    @GetMapping("/student-list")
    public ResponseEntity<?> getStudents(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        List<CourseEnrollment> courseEnrollments = courseEnrollmentService.findByInstructorId(userDetails.getId());
        List<ClassEnrollment> classEnrollments = classEnrollmentService.findByInstructorId(userDetails.getId());

        Map<Integer, StudentResponse> map = new HashMap<>();
        for (CourseEnrollment ce : courseEnrollments) {
            User user = ce.getUser();
            map.putIfAbsent(user.getId(), new StudentResponse(
                    user.getId(),
                    user.getFullName(),
                    user.getUsername(),
                    user.getEmail(),
                    new ArrayList<>(),
                    new ArrayList<>(),
                    ce.isStatus()
            ));
            map.get(user.getId()).getCourses().add(ce.getCourse().getName());
        }

        for (ClassEnrollment ce : classEnrollments) {
            User user = ce.getUser();
            map.putIfAbsent(user.getId(), new StudentResponse(
                    user.getId(),
                    user.getFullName(),
                    user.getUsername(),
                    user.getEmail(),
                    new ArrayList<>(),
                    new ArrayList<>(),
                    ce.isStatus()
            ));
            map.get(user.getId()).getClasses().add(ce.getClazz().getName());
        }

        return ResponseEntity.ok(new ArrayList<>(map.values()));
    }
}
