package main.service.interfaces;

import main.dto.response.ClassEnrollmentResponse;
import main.dto.response.EnrollmentResponse;
import main.dto.response.MonthlyRevenueResponse;
import main.entity.ClassEnrollment;
import main.entity.User;

import java.math.BigDecimal;
import java.util.List;

public interface IClassEnrollmentService {
    void enroll(User user, Integer itemId, BigDecimal amount);
    boolean hasEnrolled(Integer classId, Integer userId);
    List<EnrollmentResponse> findByUserId(Integer userId, String keyword, String sortBy, String sortDir);
    List<ClassEnrollment> findByInstructorId(Integer instructorId);
}
