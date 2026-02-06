package main.service.classes;

import com.github.slugify.Slugify;
import lombok.RequiredArgsConstructor;
import main.configuration.CloudinaryService;
import main.dto.request.UpdateCourseRequest;
import main.dto.response.CourseResponse;
import main.entity.Course;
import main.entity.Setting;
import main.entity.User;
import main.repository.CourseRepository;
import main.repository.SettingRepository;
import main.repository.UserRepository;
import main.service.interfaces.ICourseService;
import main.utils.HtmlSanitizerUtil;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CourseService implements ICourseService {
    private final CourseRepository courseRepository;
    private final SettingRepository settingRepository;
    private final UserRepository userRepository;
    private final ModelMapper modelMapper;
    private final Slugify slugify;
    private final CloudinaryService cloudinaryService;

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
    public List<CourseResponse> getAllCourses(String keyword, Integer categoryId, Integer instructorId, Boolean status, String sortBy, String sortDir) {
        Sort sort = Sort.by(sortDir.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC, sortBy);
        List<Course> courses = courseRepository.findAllCourses(keyword, categoryId, instructorId, status, sort);
        return courses.stream().map(course -> modelMapper.map(course, CourseResponse.class)).toList();
    }

    @Transactional
    @Override
    public void updateStatus(Integer id) {
        Course course = courseRepository.findById(id).orElseThrow(() -> new RuntimeException("Course not found!"));
        course.setStatus(!course.isStatus());
    }

    @Override
    public void updateCourse(Integer id, UpdateCourseRequest request, MultipartFile thumbnail) {
        List<Setting> categories = new ArrayList<>();
        Course course = courseRepository.findById(id).orElseThrow(() -> new RuntimeException("Course not found"));

        boolean updated = false;

        if (request.getName() != null) {
            if (request.getName().isBlank()) {
                throw new RuntimeException("Course name cannot be blank");
            }
            course.setName(request.getName());
            updated = true;
        }

        if (request.getCategoryIds() != null) {
            if (request.getCategoryIds().isEmpty()) {
                throw new RuntimeException("Please select at least one category!");
            }
            for (Integer categoryId : request.getCategoryIds()) {
                Setting category = settingRepository.findById(categoryId).orElseThrow(() -> new RuntimeException("Category with id = " + id + " not found!"));
                categories.add(category);
            }
            course.setCategories(categories);
            updated = true;
        }

        if (request.getListedPrice() != null) {
            if (request.getListedPrice().isBlank()) {
                throw new RuntimeException("Listed Price must have a value!");
            }

            BigDecimal listedPrice = new BigDecimal(request.getListedPrice());
            course.setListedPrice(listedPrice);
            updated = true;
        }

        if (request.getSalePrice() != null) {
            if (request.getSalePrice().isBlank()) {
                course.setSalePrice(null);
            }

            else {
                BigDecimal salePrice = new BigDecimal(request.getSalePrice());
                course.setSalePrice(salePrice);
                updated = true;
            }
        }

        if (request.getInstructorId() != null) {
            User user = userRepository.findById(request.getInstructorId()).orElseThrow(() -> new RuntimeException("Instructor not found!"));
            course.setInstructor(user);
            updated = true;
        }

        if (thumbnail != null && !thumbnail.isEmpty()) {
            String thumbnailUrl = cloudinaryService.uploadCourseThumbnail(thumbnail, id);
            course.setThumbnailUrl(thumbnailUrl);
            updated = true;
        }

        if (request.getDescription() != null) {
            String safeHtml = HtmlSanitizerUtil.sanitize(request.getDescription());
            course.setDescription(safeHtml);
            updated = true;
        }

        if (request.getStatus() != null) {
            course.setStatus(request.getStatus());
            updated = true;
        }

        if (!updated) {
            throw new RuntimeException("No fields to update");
        }
        courseRepository.save(course);
    }
}
