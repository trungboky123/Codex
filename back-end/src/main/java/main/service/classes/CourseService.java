package main.service.classes;

import com.github.slugify.Slugify;
import lombok.RequiredArgsConstructor;
import main.configuration.CloudinaryService;
import main.dto.request.CreateCourseRequest;
import main.dto.request.UpdateCourseRequest;
import main.dto.response.CourseResponse;
import main.dto.response.ImportCourseResponse;
import main.entity.Course;
import main.entity.Setting;
import main.entity.User;
import main.repository.CourseRepository;
import main.repository.SettingRepository;
import main.repository.UserRepository;
import main.service.interfaces.ICourseService;
import main.utils.HtmlSanitizerUtil;
import main.utils.XLSXUtil;
import org.apache.poi.ss.usermodel.*;
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
        return courses.stream().map(course -> {
            CourseResponse response = modelMapper.map(course, CourseResponse.class);
            response.setSlug(slugify.slugify(response.getName()));
            return response;
        }).toList();
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

    @Override
    public void createCourse(CreateCourseRequest request, MultipartFile thumbnail) {
        List<Setting> categories = new ArrayList<>();
        Course course = new Course();
        course.setName(request.getName());

        for (Integer categoryId : request.getCategoryIds()) {
            Setting category = settingRepository.findById(categoryId).orElseThrow(() -> new RuntimeException("Category not found!"));
            categories.add(category);
        }
        course.setCategories(categories);

        User user = userRepository.findById(request.getInstructorId()).orElseThrow(() -> new RuntimeException("Instructor not found!"));
        course.setInstructor(user);

        BigDecimal listedPrice = new BigDecimal(request.getListedPrice());
        course.setListedPrice(listedPrice);

        if (request.getSalePrice() == null || request.getSalePrice().isBlank()) {
            course.setSalePrice(null);
        }
        else {
            BigDecimal salePrice = new BigDecimal(request.getSalePrice());
            course.setSalePrice(salePrice);
        }

        if (request.getDescription() != null && !request.getDescription().isBlank()) {
            String safeHtml = HtmlSanitizerUtil.sanitize(request.getDescription());
            course.setDescription(safeHtml);
        }

        course.setDuration(request.getDuration());
        course.setStatus(request.getStatus());

        courseRepository.save(course);

        if (thumbnail != null && !thumbnail.isEmpty()) {
            String thumbnailUrl = cloudinaryService.uploadCourseThumbnail(thumbnail, course.getId());
            course.setThumbnailUrl(thumbnailUrl);
        }

        courseRepository.save(course);
    }

    @Override
    public ImportCourseResponse importCourses(MultipartFile file) {
        int total = 0;
        int success = 0;
        List<String> errors = new ArrayList<>();

        try (Workbook workbook = WorkbookFactory.create(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            for (int i = 2; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;
                total++;

                try {
                    importSingleCourse(row);
                    success++;
                } catch (Exception e) {
                    errors.add("Row " + (i + 1) + ": " + e.getMessage());
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("Cannot read Excel file", e);
        }

        return new ImportCourseResponse(total, success, total - success, errors);
    }

    private void importSingleCourse(Row row) {
        List<Setting> categories = new ArrayList<>();
        String name = XLSXUtil.getCell(row, 0);
        String listedPriceStr = XLSXUtil.getCell(row, 1);
        String salePriceStr = XLSXUtil.getCell(row, 2);

        Cell categoriesCell = row.getCell(3);
        String[] categoriesStr = XLSXUtil.parseMultipleData(categoriesCell);

        String instructor = XLSXUtil.getCell(row, 4);
        String duration = XLSXUtil.getCell(row, 5);
        String statusStr = XLSXUtil.getCell(row, 6);

        if (name == null || name.isBlank()) {
            throw new RuntimeException("Course name is blank");
        }

        if (listedPriceStr == null || listedPriceStr.isBlank()) {
            throw new RuntimeException("Listed Price is blank");
        }

        if (categoriesStr.length == 0) {
            throw new RuntimeException("Categories are blank");
        }

        if (instructor == null || instructor.isBlank()) {
            throw new RuntimeException("Instructor is blank");
        }

        if (duration == null || duration.isBlank()) {
            throw new RuntimeException("Duration is blank");
        }

        if (statusStr == null || statusStr.isBlank()) {
            throw new RuntimeException("Status is blank");
        }

        if (!statusStr.equalsIgnoreCase("true") &&
                !statusStr.equalsIgnoreCase("false")) {
            throw new RuntimeException("Status must be true/false!");
        }

        for (String category : categoriesStr) {
            String categoryName = XLSXUtil.normalizeName(category);
            Setting cat = settingRepository.findByName(categoryName).orElseThrow(() -> new RuntimeException("Category " + category + " not found!"));
            categories.add(cat);
        }

        User user = userRepository.findByFullName(instructor).orElseThrow(() -> new RuntimeException("Instructor " + instructor + " not found!"));

        Course course = new Course();
        course.setName(name);
        try {
            course.setListedPrice(new BigDecimal(listedPriceStr));
            if (salePriceStr == null || salePriceStr.isBlank()) {
                course.setSalePrice(null);
            }
            else {
                course.setSalePrice(new BigDecimal(salePriceStr));
            }
        } catch (NumberFormatException e) {
            throw new RuntimeException("Listed Price or Sale Price is invalid!");
        }
        course.setInstructor(user);
        try {
            course.setDuration(Integer.parseInt(duration));
        } catch (NumberFormatException e) {
            throw new RuntimeException("Duration is invalid!");
        }

        course.setCategories(categories);
        course.setStatus(Boolean.parseBoolean(statusStr));
        courseRepository.save(course);
    }
}
