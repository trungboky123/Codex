package main.service.interfaces;

import main.dto.response.CourseResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ICourseService {
    List<CourseResponse> getHighlightedCourses();
    Page<CourseResponse> getAllCourses(Pageable pageable, Long categoryId, String sortByPrice, String keyword);
    CourseResponse getCourseById(Integer id);
}
