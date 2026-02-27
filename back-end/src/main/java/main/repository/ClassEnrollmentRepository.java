package main.repository;

import main.dto.response.ClassEnrollmentResponse;
import main.dto.response.EnrollmentResponse;
import main.dto.response.MonthlyRevenueResponse;
import main.entity.Class;
import main.entity.ClassEnrollment;
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
public interface ClassEnrollmentRepository extends JpaRepository<ClassEnrollment, Integer> {
    boolean existsByClazzAndUser(Class clazz, User user);

    @Query("SELECT new main.dto.response.EnrollmentResponse(c.id, 'Class', c.thumbnailUrl, c.name, ce.enrolledAt) " +
            "FROM ClassEnrollment ce " +
            "JOIN ce.clazz c " +
            "WHERE ce.user = :user " +
            "AND (:keyword IS NULL OR LOWER(c.name) LIKE LOWER(CONCAT('%', :keyword, '%')))" +
            "AND ce.status = true")
    List<EnrollmentResponse> findByUser(@Param("user") User user, @Param("keyword") String keyword, Sort sort);

    List<ClassEnrollment> findByClazz_Instructor(User instructor);
}
