package main.service.classes;

import lombok.RequiredArgsConstructor;
import main.dto.response.ClassResponse;
import main.entity.Class;
import main.repository.ClassRepository;
import main.service.interfaces.IClassService;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ClassService implements IClassService {
    private final ClassRepository classRepository;
    private final ModelMapper modelMapper;

    @Override
    public Page<ClassResponse> getAllClasses(Pageable pageable, Long categoryId, String sortByPrice, String keyword) {
        Page<Class> classes;
        if ("asc".equalsIgnoreCase(sortByPrice)) {
            classes = classRepository.findByCategorySortByPriceAsc(categoryId, keyword, pageable);
        }
        else if ("desc".equalsIgnoreCase(sortByPrice)) {
            classes = classRepository.findByCategorySortByPriceDesc(categoryId, keyword, pageable);
        }
        else {
            classes = classRepository.findByFilter(categoryId, keyword, pageable);
        }

        return classes.map(c -> modelMapper.map(c, ClassResponse.class));
    }
}
