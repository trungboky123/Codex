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
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

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

    @Override
    public List<ClassResponse> getAllClasses(String keyword, Integer categoryId, Integer instructorId, Boolean status, String sortBy, String sortDir) {
        Sort sort = Sort.by(sortDir.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC, sortBy);
        List<Class> classes = classRepository.findAllClasses(keyword, categoryId, instructorId, status, sort);
        return classes.stream().map(clazz -> modelMapper.map(clazz, ClassResponse.class)).toList();
    }

    @Override
    public void updateStatus(Integer id) {
        Class clazz = classRepository.findById(id).orElseThrow(() -> new RuntimeException("Class not found!"));
        clazz.setStatus(!clazz.isStatus());
    }
}
