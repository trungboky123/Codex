package main.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import main.dto.request.CreateCourseRequest;
import main.dto.request.UpdateCourseRequest;
import main.dto.response.CourseResponse;
import main.dto.response.ImportResponse;
import main.service.interfaces.ICourseService;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;
import java.util.Map;

@RequiredArgsConstructor
@RestController
@CrossOrigin("http://localhost:3000")
@RequestMapping("/courses")
public class CourseController {
    private final ICourseService courseService;

    @GetMapping("/highlighted")
    public ResponseEntity<?> getHighlightedCourses() {
        List<CourseResponse> highlightedCourses = courseService.getHighlightedCourses();
        return ResponseEntity.ok(highlightedCourses);
    }

    @GetMapping("/public")
    public ResponseEntity<?> getPublicCourses(
            @PageableDefault(size = 12) Pageable pageable,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String sortByPrice,
            @RequestParam(required = false) String keyword
    ) {
        Page<CourseResponse> courses = courseService.getPublicCourses(pageable, categoryId, sortByPrice, keyword);
        return ResponseEntity.ok(courses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getCourseById(@PathVariable Integer id) {
        CourseResponse course = courseService.getCourseById(id);
        return ResponseEntity.ok(course);
    }

    @GetMapping("/total")
    public ResponseEntity<?> getTotalCourses() {
        Long count = courseService.getTotalCourses();
        return ResponseEntity.ok(Map.of(
                "totalCourses", count
        ));
    }

    @GetMapping("/admin/getAll")
    public ResponseEntity<?> getAllCourses(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer categoryId,
            @RequestParam(required = false) Integer instructorId,
            @RequestParam(required = false) Boolean status,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir
    ) {
        List<CourseResponse> courses = courseService.getAllCourses(keyword, categoryId, instructorId, status, sortBy, sortDir);
        return ResponseEntity.ok(courses);
    }

    @PutMapping("/status/{id}")
    public ResponseEntity<?> updateStatus(@PathVariable Integer id) {
        courseService.updateStatus(id);
        return ResponseEntity.ok().build();
    }

    @PatchMapping(value = "/update/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateCourse(@PathVariable Integer id, @Valid @RequestPart(value = "data", required = false) UpdateCourseRequest request, @RequestPart(value = "thumbnail", required = false) MultipartFile thumbnail) {
        courseService.updateCourse(id, request, thumbnail);
        return ResponseEntity.ok(Map.of(
                "message", "Updated Successfully!"
        ));
    }

    @PostMapping(value = "/create", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createCourse(@Valid @RequestPart(value = "data", required = false) CreateCourseRequest request, @RequestPart(value = "thumbnail", required = false) MultipartFile thumbnail) {
        courseService.createCourse(request, thumbnail);
        return ResponseEntity.ok(Map.of(
                "message", "Created Successfully!"
        ));
    }

    @GetMapping("/download-template")
    public ResponseEntity<?> downloadTemplate() throws IOException {
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Courses");

        // Attention Style
        CellStyle attentionStyle = workbook.createCellStyle();
        Font attentionFont = workbook.createFont();
        attentionFont.setBold(true);
        attentionFont.setColor(IndexedColors.RED.getIndex());
        attentionStyle.setFont(attentionFont);

        // Headers style
        CellStyle headerStyle = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        headerStyle.setFont(font);

        // Attention row
        Row attentionRow = sheet.createRow(0);
        String attention = "(DO NOT DELETE THIS LINE) ATTENTION: Each category must be separated by '|' when courses have more than 1 category";
        Cell attentionCell = attentionRow.createCell(0);
        attentionCell.setCellValue(attention);
        attentionCell.setCellStyle(attentionStyle);

        // Header row
        Row header = sheet.createRow(1);
        String[] headers = {"name", "listed_price", "sale_price", "categories", "instructor", "duration", "status"};
        for(int i = 0; i < headers.length; i++) {
            Cell cell = header.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }
        sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, headers.length - 1));

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        workbook.write(outputStream);
        workbook.close();

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=course_template.xlsx")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(outputStream.toByteArray());
    }

    @PostMapping("/import")
    public ResponseEntity<?> importCourses(@RequestParam("file") MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "File is empty!"
            ));
        }

        ImportResponse response = courseService.importCourses(file);
        return ResponseEntity.ok(response);
    }
}
