package main.service.interfaces;

import main.dto.request.CreateCourseRequest;
import main.dto.request.UpdateCourseRequest;
import main.dto.response.CourseResponse;
import main.dto.response.ImportResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ICourseService {
    List<CourseResponse> getHighlightedCourses();
    Page<CourseResponse> getPublicCourses(Pageable pageable, Long categoryId, String sortByPrice, String keyword);
    CourseResponse getCourseById(Integer id);
    Long getTotalCourses();
    List<CourseResponse> getAllCourses(String keyword, Integer categoryId, Integer instructorId, Boolean status, String sortBy, String sortDir);
    void updateStatus(Integer id);
    void updateCourse(Integer id, UpdateCourseRequest request, MultipartFile thumbnail);
    void createCourse(CreateCourseRequest request, MultipartFile thumbnail);
    ImportResponse importCourses(MultipartFile file);
}
