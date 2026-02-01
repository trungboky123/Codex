package main.service.interfaces;

import main.dto.response.ClassEnrollmentResponse;
import main.dto.response.MonthlyRevenueResponse;
import main.entity.User;

import java.math.BigDecimal;
import java.util.List;

public interface IClassEnrollmentService {
    BigDecimal getTotalPrice();
    List<ClassEnrollmentResponse> getTopSoldClasses();
    List<MonthlyRevenueResponse> getMonthlyRevenue();
    void enroll(User user, Integer itemId, Long amount);
    boolean hasEnrolled(Integer classId, Integer userId);
}
