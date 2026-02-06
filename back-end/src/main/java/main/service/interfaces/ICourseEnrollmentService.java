package main.service.interfaces;

import main.dto.response.CourseEnrollmentResponse;
import main.dto.response.MonthlyRevenueResponse;
import main.entity.User;

import java.math.BigDecimal;
import java.util.List;

public interface ICourseEnrollmentService {
    BigDecimal getTotalPrice();
    List<CourseEnrollmentResponse> getTopSoldCourses();
    List<MonthlyRevenueResponse> getMonthlyRevenue();
    void enroll(User user, Integer courseId, Long amount);
    boolean hasEnrolled(Integer courseId, Integer userId);
    void enrollFreeCourse(Integer userId, Integer courseId);
}
