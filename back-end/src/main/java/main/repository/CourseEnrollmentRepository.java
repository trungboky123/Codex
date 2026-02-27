package main.repository;

import main.dto.response.EnrollmentResponse;
import main.dto.response.MonthlyRevenueResponse;
import main.entity.Course;
import main.entity.CourseEnrollment;
import main.entity.User;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CourseEnrollmentRepository extends JpaRepository<CourseEnrollment, Integer> {
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
