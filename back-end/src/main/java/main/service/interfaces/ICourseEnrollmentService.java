package main.service.interfaces;

import main.dto.response.EnrollmentResponse;
import main.entity.CourseEnrollment;
import main.entity.User;

import java.math.BigDecimal;
import java.util.List;

public interface ICourseEnrollmentService {
    void enroll(User user, Integer courseId, BigDecimal amount);
    boolean hasEnrolled(Integer courseId, Integer userId);
    void enrollFreeCourse(Integer userId, Integer courseId);
    List<EnrollmentResponse> findByUserId(Integer userId, String keyword, String sortDate, String sortDir);
    List<CourseEnrollment> findByInstructorId(Integer instructorId);
}
