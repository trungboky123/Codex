package main.repository;

import main.entity.Course;
import main.entity.Setting;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SettingRepository extends JpaRepository<Setting, Integer> {
    Optional<Setting> findByName(String name);
    List<Setting> findAllByParent_NameAndStatusTrue(String name);
    List<Setting> findByParentIsNullAndStatusTrue();

    @Query("SELECT DISTINCT s FROM Setting s " +
            "LEFT JOIN s.parent p " +
            "WHERE (:typeId IS NULL OR s.parent.id = :typeId) " +
            "AND (:keyword IS NULL OR LOWER(s.name) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
            "AND (:status IS NULL OR s.status = :status)")
    List<Setting> findAllSettings(
            @Param("keyword") String keyword,
            @Param("typeId") Integer typeId,
            @Param("status") Boolean status,
            Sort sort
    );

    boolean existsByName(String name);

    @Query("SELECT DISTINCT s " +
            "FROM Course c " +
            "JOIN c.categories s " +
            "WHERE c.id = :courseId")
    List<Setting> findByCourseId(@Param("courseId") Integer courseId);

    @Query("SELECT DISTINCT s " +
            "FROM Class c " +
            "JOIN c.categories s " +
            "WHERE c.id = :classId")
    List<Setting> findByClassId(@Param("classId") Integer classId);
}
