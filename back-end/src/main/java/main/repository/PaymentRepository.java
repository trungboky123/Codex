package main.repository;

import main.dto.response.ClassEnrollmentResponse;
import main.dto.response.CourseEnrollmentResponse;
import main.dto.response.MonthlyRevenueResponse;
import main.entity.Payment;
import main.entity.User;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByOrderCode(Long orderCode);
    List<Payment> findByUserAndStatusOrderByPaidAtDesc(User user, String status);

    @Query("SELECT new main.dto.response.CourseEnrollmentResponse(p.itemId, c.name, c.thumbnailUrl, COUNT(p), SUM(p.amount)) " +
            "FROM Payment p " +
            "JOIN Course c ON p.itemId = c.id " +
            "WHERE p.status = 'Paid' AND p.itemType = 'Course'" +
            "GROUP BY c.id, c.name, c.thumbnailUrl " +
            "ORDER BY COUNT(p) DESC")
    List<CourseEnrollmentResponse> getTopSoldCourses(Pageable pageable);

    @Query("SELECT new main.dto.response.ClassEnrollmentResponse(p.itemId, c.name, c.thumbnailUrl, COUNT(p), SUM(p.amount)) " +
            "FROM Payment p " +
            "JOIN Class c ON p.itemId = c.id " +
            "WHERE p.status = 'Paid' AND p.itemType = 'Class'" +
            "GROUP BY c.id, c.name, c.thumbnailUrl " +
            "ORDER BY COUNT(p) DESC")
    List<ClassEnrollmentResponse> getTopSoldClasses(Pageable pageable);

    @Query("SELECT SUM(p.amount) " +
            "FROM Payment p " +
            "WHERE p.status = 'Paid' AND MONTH(p.createdAt) = MONTH(CURRENT_DATE) AND YEAR(p.createdAt) = YEAR(CURRENT_DATE)")
    BigDecimal sumAmount();

    @Query("SELECT new main.dto.response.MonthlyRevenueResponse(MONTH(p.createdAt), SUM(p.amount)) " +
            "FROM Payment p " +
            "WHERE p.status = 'Paid' AND YEAR(p.createdAt) = YEAR(CURRENT_DATE) " +
            "GROUP BY MONTH(p.createdAt) " +
            "ORDER BY MONTH(p.createdAt)")
    List<MonthlyRevenueResponse> getMonthlyRevenue();
}
