package main.repository;

import main.dto.response.ClassEnrollmentResponse;
import main.entity.ClassEnrollment;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.util.List;

@Repository
public interface ClassEnrollmentRepository extends JpaRepository<ClassEnrollment, Integer> {
    @Query("SELECT SUM(ce.pricePaid) FROM ClassEnrollment ce " +
            "WHERE MONTH(ce.enrolledAt) = MONTH(CURRENT_DATE) " +
            "AND YEAR(ce.enrolledAt) = YEAR(CURRENT_DATE) " +
            "AND ce.status = true")
    BigDecimal sumPricePaid();

    @Query("SELECT new main.dto.response.ClassEnrollmentResponse(c.id, c.name, c.thumbnailUrl, COUNT(ce), SUM(ce.pricePaid)) " +
            "FROM ClassEnrollment ce " +
            "JOIN ce.clazz c " +
            "WHERE ce.status = true " +
            "GROUP BY c.id, c.name, c.thumbnailUrl " +
            "ORDER BY COUNT(ce) DESC")
    List<ClassEnrollmentResponse> getTopSoldClasses(Pageable pageable);
}
