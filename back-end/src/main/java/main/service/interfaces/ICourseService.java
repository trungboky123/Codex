package main.service.interfaces;

import main.dto.response.CourseResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ICourseService {
    List<CourseResponse> getHighlightedCourses();
    Page<CourseResponse> getPublicCourses(Pageable pageable, Long categoryId, String sortByPrice, String keyword);
    CourseResponse getCourseById(Integer id);
    Long getTotalCourses();
    List<CourseResponse> getAllCourses(String keyword, Integer categoryId, Integer instructorId, Boolean status, String sortBy, String sortDir);
    void updateStatus(Integer id);
}
