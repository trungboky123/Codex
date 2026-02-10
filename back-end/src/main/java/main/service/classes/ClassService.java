package main.service.classes;

import com.github.slugify.Slugify;
import lombok.RequiredArgsConstructor;
import main.configuration.CloudinaryService;
import main.dto.request.CreateClassRequest;
import main.dto.request.UpdateClassRequest;
import main.dto.response.ClassResponse;
import main.dto.response.ImportResponse;
import main.entity.Class;
import main.entity.Course;
import main.entity.Setting;
import main.entity.User;
import main.repository.ClassRepository;
import main.repository.SettingRepository;
import main.repository.UserRepository;
import main.service.interfaces.IClassService;
import main.utils.HtmlUtil;
import main.utils.XLSXUtil;
import org.apache.poi.ss.formula.functions.PPMT;
import org.apache.poi.ss.usermodel.*;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ClassService implements IClassService {
    private final ClassRepository classRepository;
    private final SettingRepository settingRepository;
    private final UserRepository userRepository;
    private final CloudinaryService cloudinaryService;
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
        return classes.stream().map(clazz -> {
            ClassResponse response = modelMapper.map(clazz, ClassResponse.class);
            response.setSlug(slugify.slugify(response.getName()));
            return response;
        }).toList();
    }

    @Transactional
    @Override
    public void updateStatus(Integer id) {
        Class clazz = classRepository.findById(id).orElseThrow(() -> new RuntimeException("Class not found!"));
        clazz.setStatus(!clazz.isStatus());
    }

    @Override
    public void updateClass(Integer id, UpdateClassRequest request, MultipartFile thumbnail) {
        List<Setting> categories = new ArrayList<>();
        Class clazz = classRepository.findById(id).orElseThrow(() -> new RuntimeException("Class not found"));

        boolean updated = false;

        if (request.getName() != null) {
            if (request.getName().isBlank()) {
                throw new RuntimeException("Class name cannot be blank");
            }
            if (classRepository.existsByNameEqualsIgnoreCase(request.getName())) {
                throw new RuntimeException("Class name has already existed!");
            }
            clazz.setName(request.getName());
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
            clazz.setCategories(categories);
            updated = true;
        }

        if (request.getListedPrice() != null) {
            if (request.getListedPrice().isBlank()) {
                throw new RuntimeException("Listed Price must have a value!");
            }

            BigDecimal listedPrice = new BigDecimal(request.getListedPrice());
            clazz.setListedPrice(listedPrice);
            updated = true;
        }

        if (request.getSalePrice() != null) {
            if (request.getSalePrice().isBlank()) {
                clazz.setSalePrice(null);
            }

            else {
                BigDecimal salePrice = new BigDecimal(request.getSalePrice());
                clazz.setSalePrice(salePrice);
                updated = true;
            }
        }

        if (request.getInstructorId() != null) {
            User user = userRepository.findById(request.getInstructorId()).orElseThrow(() -> new RuntimeException("Instructor not found!"));
            clazz.setInstructor(user);
            updated = true;
        }

        if (thumbnail != null && !thumbnail.isEmpty()) {
            String thumbnailUrl = cloudinaryService.uploadClassThumbnail(thumbnail, id);
            clazz.setThumbnailUrl(thumbnailUrl);
            updated = true;
        }

        if (request.getDescription() != null) {
            String safeHtml = HtmlUtil.sanitize(request.getDescription());
            clazz.setDescription(safeHtml);
            updated = true;
        }

        if (request.getStatus() != null) {
            clazz.setStatus(request.getStatus());
            updated = true;
        }

        LocalDate startDate = request.getStartDate();
        LocalDate endDate = request.getEndDate();
        if (startDate != null || endDate != null) {

            LocalDate finalStart = startDate != null ? startDate : clazz.getStartDate();
            LocalDate finalEnd = endDate != null ? endDate : clazz.getEndDate();

            if (finalStart != null && finalEnd != null && finalStart.isAfter(finalEnd)) {
                throw new RuntimeException("Start Date must be before End Date!");
            }

            if (startDate != null) {
                clazz.setStartDate(startDate);
                updated = true;
            }

            if (endDate != null) {
                clazz.setEndDate(endDate);
                updated = true;
            }
        }

        if (!updated) {
            throw new RuntimeException("No fields to update");
        }
        classRepository.save(clazz);
    }

    @Override
    public void createClass(CreateClassRequest request, MultipartFile thumbnail) {
        List<Setting> categories = new ArrayList<>();
        Class clazz = new Class();
        clazz.setName(request.getName());

        for (Integer categoryId : request.getCategoryIds()) {
            Setting category = settingRepository.findById(categoryId).orElseThrow(() -> new RuntimeException("Category not found!"));
            categories.add(category);
        }
        clazz.setCategories(categories);

        User user = userRepository.findById(request.getInstructorId()).orElseThrow(() -> new RuntimeException("Instructor not found!"));
        clazz.setInstructor(user);

        BigDecimal listedPrice = new BigDecimal(request.getListedPrice());
        clazz.setListedPrice(listedPrice);

        if (request.getSalePrice() == null || request.getSalePrice().isBlank()) {
            clazz.setSalePrice(null);
        }
        else {
            BigDecimal salePrice = new BigDecimal(request.getSalePrice());
            clazz.setSalePrice(salePrice);
        }

        if (request.getDescription() != null && !request.getDescription().isBlank()) {
            String safeHtml = HtmlUtil.sanitize(request.getDescription());
            clazz.setDescription(safeHtml);
        }

        if (request.getStartDate().isAfter(request.getEndDate())) {
            throw new RuntimeException("Start Date must be before End Date!");
        }

        clazz.setStartDate(request.getStartDate());
        clazz.setEndDate(request.getEndDate());
        clazz.setStatus(request.getStatus());

        classRepository.save(clazz);

        if (thumbnail != null && !thumbnail.isEmpty()) {
            String thumbnailUrl = cloudinaryService.uploadClassThumbnail(thumbnail, clazz.getId());
            clazz.setThumbnailUrl(thumbnailUrl);
        }

        classRepository.save(clazz);
    }

    @Override
    public ImportResponse importClasses(MultipartFile file) {
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

        return new ImportResponse(total, success, total - success, errors);
    }

    private void importSingleCourse(Row row) {
        List<Setting> categories = new ArrayList<>();
        String name = XLSXUtil.getCell(row, 0);
        String listedPriceStr = XLSXUtil.getCell(row, 1);
        String salePriceStr = XLSXUtil.getCell(row, 2);

        Cell categoriesCell = row.getCell(3);
        String[] categoriesStr = XLSXUtil.parseMultipleData(categoriesCell);

        String instructor = XLSXUtil.getCell(row, 4);
        String statusStr = XLSXUtil.getCell(row, 7);

        if (name == null || name.isBlank()) {
            throw new RuntimeException("Class name is blank");
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

        Class clazz = new Class();
        clazz.setName(name);
        try {
            clazz.setListedPrice(new BigDecimal(listedPriceStr));
            if (salePriceStr == null || salePriceStr.isBlank()) {
                clazz.setSalePrice(null);
            }
            else {
                clazz.setSalePrice(new BigDecimal(salePriceStr));
            }
        } catch (NumberFormatException e) {
            throw new RuntimeException("Listed Price or Sale Price is invalid!");
        }
        clazz.setInstructor(user);

        LocalDate startDate;
        LocalDate endDate;
        try {
            startDate = XLSXUtil.parseExcelDate(row.getCell(5), "Start Date");
            endDate = XLSXUtil.parseExcelDate(row.getCell(6), "End Date");

            if (startDate.isAfter(endDate)) {
                throw new RuntimeException("Start Date must be before End Date!");
            }
        } catch (DateTimeParseException e) {
            throw new RuntimeException("Start Date or End Date is invalid!");
        }

        clazz.setStartDate(startDate);
        clazz.setEndDate(endDate);
        clazz.setCategories(categories);
        clazz.setStatus(Boolean.parseBoolean(statusStr));
        classRepository.save(clazz);
    }
}
