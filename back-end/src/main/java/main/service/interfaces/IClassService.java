package main.service.interfaces;

import main.dto.response.ClassResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface IClassService {
    Page<ClassResponse> getPublicClasses(Pageable pageable, Long categoryId, String sortByPrice, String keyword);
    ClassResponse getClassById(Integer id);
    Long getTotalClasses();
}
