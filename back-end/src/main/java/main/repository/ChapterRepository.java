package main.repository;

import main.entity.Chapter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ChapterRepository extends JpaRepository<Chapter, Integer> {
    @Query("SELECT DISTINCT c " +
            "FROM Chapter c " +
            "LEFT JOIN FETCH c.lessons l " +
            "WHERE c.course.id = :id " +
            "AND c.status = true " +
            "AND l.status = true")
    List<Chapter> getChaptersByCourse_IdAndStatusTrue(Integer id);
    Long countByCourse_Id(Integer id);
}
