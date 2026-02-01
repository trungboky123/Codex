package main.service.interfaces;

import main.dto.response.ClassResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface IClassService {
    Page<ClassResponse> getPublicClasses(Pageable pageable, Long categoryId, String sortByPrice, String keyword);
    ClassResponse getClassById(Integer id);
    Long getTotalClasses();
    List<ClassResponse> getAllClasses(String keyword, Integer categoryId, Integer instructorId, Boolean status, String sortBy, String sortDir);
    void updateStatus(Integer id);
}
