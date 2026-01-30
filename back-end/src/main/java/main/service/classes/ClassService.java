package main.service.classes;

import com.github.slugify.Slugify;
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
    private final Slugify slugify;

    @Override
    public Page<ClassResponse> getPublicClasses(Pageable pageable, Long categoryId, String sortByPrice, String keyword) {
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

        return classes.map(c -> {
            ClassResponse response = modelMapper.map(c, ClassResponse.class);
            response.setSlug(slugify.slugify(response.getName()));
            return response;
        });
    }

    @Override
    public ClassResponse getClassById(Integer id) {
        Class clazz = classRepository.findById(id).orElseThrow(() -> new RuntimeException("Class not found!"));
        ClassResponse response = modelMapper.map(clazz, ClassResponse.class);
        response.setSlug(slugify.slugify(response.getName()));
        return response;
    }

    @Override
    public Long getTotalClasses() {
        return classRepository.count();
    }
}
