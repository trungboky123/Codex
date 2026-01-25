package main.repository;

import main.entity.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LessonRepository extends JpaRepository<Lesson, Integer> {
    List<Lesson> findAllByChapter_IdAndStatusTrue(Integer id);
    Long countByChapter_IdAndStatusTrue(Integer id);
}
