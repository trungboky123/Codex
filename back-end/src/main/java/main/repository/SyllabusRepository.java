package main.repository;

import main.entity.Class;
import main.entity.Syllabus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SyllabusRepository extends JpaRepository<Syllabus, Integer> {
    Syllabus findByClazz(Class clazz);
}
