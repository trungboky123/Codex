package main.repository;

import main.dto.response.CourseEnrollmentResponse;
import main.entity.CourseEnrollment;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
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
}
