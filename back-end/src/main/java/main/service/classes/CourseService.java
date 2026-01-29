package main.service.classes;

import com.github.slugify.Slugify;
import lombok.RequiredArgsConstructor;
import main.dto.response.CourseResponse;
import main.entity.Course;
import main.repository.CourseRepository;
import main.service.interfaces.ICourseService;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CourseService implements ICourseService {
    private final CourseRepository courseRepository;
    private final ModelMapper modelMapper;
    private final Slugify slugify;

    @Override
    public List<CourseResponse> getHighlightedCourses() {
        List<Course> highlightedCourses = courseRepository.findAllByOrderByIdDesc(PageRequest.of(0, 8));
        return highlightedCourses.stream().map(course -> {
            CourseResponse response = modelMapper.map(course, CourseResponse.class);
            response.setSlug(slugify.slugify(response.getName()));
            return response;
        }).toList();
    }

    @Override
    public Page<CourseResponse> getPublicCourses(Pageable pageable, Long categoryId, String sortByPrice, String keyword) {
        Page<Course> courses;
        if ("asc".equalsIgnoreCase(sortByPrice)) {
            courses = courseRepository.findByCategorySortByPriceAsc(categoryId, keyword, pageable);
        }
        else if ("desc".equalsIgnoreCase(sortByPrice)) {
            courses = courseRepository.findByCategorySortByPriceDesc(categoryId, keyword, pageable);
        }
        else {
            courses = courseRepository.findByFilter(categoryId, keyword, pageable);
        }

        return courses.map(course -> {
            CourseResponse response = modelMapper.map(course, CourseResponse.class);
            response.setSlug(slugify.slugify(response.getName()));
            return response;
        });
    }

    @Override
    public CourseResponse getCourseById(Integer id) {
        Course course = courseRepository.findById(id).orElseThrow(() -> new RuntimeException("Course not found!"));
        CourseResponse response = modelMapper.map(course, CourseResponse.class);
        response.setSlug(slugify.slugify(response.getName()));
        return response;
    }

    @Override
    public Long getTotalCourses() {
        return courseRepository.count();
    }

    @Override
    public List<CourseResponse> getAllCourses(String keyword, Integer categoryId, Integer instructorId, Boolean status) {
        List<Course> courses = courseRepository.findAllCourses(keyword, categoryId, instructorId, status);
        return courses.stream().map(course -> modelMapper.map(course, CourseResponse.class)).toList();
    }
}
