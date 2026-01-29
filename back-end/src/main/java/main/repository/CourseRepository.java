package main.repository;

import main.entity.Course;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseRepository extends JpaRepository<Course, Integer> {
    List<Course> findAllByOrderByIdDesc(Pageable pageable);

    @Query("SELECT DISTINCT c from Course c " +
            "LEFT JOIN c.categories cat " +
            "WHERE (:categoryId IS NULL OR cat.id = :categoryId) " +
            "AND (:keyword IS NULL OR LOWER(c.name) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
            "AND c.status = true " +
            "ORDER BY COALESCE(c.salePrice, c.listedPrice)")
    Page<Course> findByCategorySortByPriceAsc(@Param("categoryId") Long categoryId, @Param("keyword") String keyword, Pageable pageable);

    @Query("SELECT DISTINCT c from Course c " +
            "LEFT JOIN c.categories cat " +
            "WHERE (:categoryId IS NULL OR cat.id = :categoryId) " +
            "AND (:keyword IS NULL OR LOWER(c.name) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
            "AND c.status = true " +
            "ORDER BY COALESCE(c.salePrice, c.listedPrice) DESC ")
    Page<Course> findByCategorySortByPriceDesc(@Param("categoryId") Long categoryId, @Param("keyword") String keyword, Pageable pageable);

    @Query("SELECT DISTINCT c from Course c " +
            "LEFT JOIN c.categories cat " +
            "WHERE (:categoryId IS NULL OR cat.id = :categoryId) " +
            "AND (:keyword IS NULL OR LOWER(c.name) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
            "AND c.status = true")
    Page<Course> findByFilter(
            @Param("categoryId") Long categoryId,
            @Param("keyword") String keyword,
            Pageable pageable
    );

    @Query("SELECT DISTINCT c FROM Course c " +
            "LEFT JOIN c.categories s " +
            "LEFT JOIN c.instructor u " +
            "WHERE (:categoryId IS NULL OR s.id = :categoryId) " +
            "AND (:keyword IS NULL OR LOWER(c.name) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
            "AND (:instructorId IS NULL OR u.id = :instructorId) " +
            "AND (:status IS NULL OR c.status = :status)")
    List<Course> findAllCourses(
            @Param("keyword") String keyword,
            @Param("categoryId") Integer categoryId,
            @Param("instructorId") Integer instructorId,
            @Param("status") Boolean status
    );
}
