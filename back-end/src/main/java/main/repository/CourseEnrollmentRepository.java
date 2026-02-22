package main.repository;

import main.dto.response.CourseEnrollmentResponse;
import main.dto.response.EnrollmentResponse;
import main.dto.response.MonthlyRevenueResponse;
import main.entity.Course;
import main.entity.CourseEnrollment;
import main.entity.User;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.util.List;

@Repository
public interface CourseEnrollmentRepository extends JpaRepository<CourseEnrollment, Integer> {
    @Query("SELECT SUM(ce.pricePaid) FROM CourseEnrollment ce " +
            "WHERE MONTH(ce.enrolledAt) = MONTH(CURRENT_DATE) " +
            "AND YEAR(ce.enrolledAt) = YEAR(CURRENT_DATE) " +
            "AND ce.status = true")
    BigDecimal sumPricePaid();

    @Query("SELECT new main.dto.response.CourseEnrollmentResponse(c.id, c.name, c.thumbnailUrl, COUNT(ce), SUM(ce.pricePaid)) " +
            "FROM CourseEnrollment ce " +
            "JOIN ce.course c " +
            "WHERE ce.status = true " +
            "GROUP BY c.id, c.name, c.thumbnailUrl " +
            "ORDER BY COUNT(ce) DESC")
    List<CourseEnrollmentResponse> getTopSoldCourses(Pageable pageable);

    @Query("SELECT new main.dto.response.MonthlyRevenueResponse(MONTH(ce.enrolledAt), SUM(ce.pricePaid)) " +
            "FROM CourseEnrollment ce " +
            "WHERE ce.status = true AND YEAR(ce.enrolledAt) = YEAR(CURRENT_DATE) " +
            "GROUP BY MONTH(ce.enrolledAt) " +
            "ORDER BY MONTH(ce.enrolledAt)")
    List<MonthlyRevenueResponse> getMonthlyRevenue();

    boolean existsByCourseAndUser(Course course, User user);

    @Query("SELECT new main.dto.response.EnrollmentResponse(c.id, 'Course', c.thumbnailUrl, c.name, ce.enrolledAt) " +
            "FROM CourseEnrollment ce " +
            "JOIN ce.course c " +
            "WHERE ce.user = :user " +
            "AND (:keyword IS NULL OR LOWER(c.name) LIKE LOWER(CONCAT('%', :keyword, '%')))" +
            "AND ce.status = true")
    List<EnrollmentResponse> findByUser(@Param("user") User user, @Param("keyword") String keyword, Sort sort);

    List<CourseEnrollment> findByCourse_Instructor(User instructor);
}
