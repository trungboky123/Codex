package main.service.interfaces;

import main.dto.request.CreateClassRequest;
import main.dto.request.UpdateClassRequest;
import main.dto.response.ClassResponse;
import main.dto.response.ImportResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface IClassService {
    Page<ClassResponse> getPublicClasses(Pageable pageable, Long categoryId, String sortByPrice, String keyword);
    ClassResponse getClassById(Integer id);
    Long getTotalClasses();
    List<ClassResponse> getAllClasses(String keyword, Integer categoryId, Integer instructorId, Boolean status, String sortBy, String sortDir);
    void updateStatus(Integer id);
    void updateClass(Integer id, UpdateClassRequest request, MultipartFile thumbnail);
    void createClass(CreateClassRequest request, MultipartFile thumbnail);
    ImportResponse importClasses(MultipartFile file);
}
