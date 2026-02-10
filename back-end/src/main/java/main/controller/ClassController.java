package main.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import main.dto.request.CreateClassRequest;
import main.dto.request.UpdateClassRequest;
import main.dto.response.ClassResponse;
import main.dto.response.ImportResponse;
import main.service.interfaces.IClassService;
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
@RequestMapping("/classes")
public class ClassController {
    private final IClassService classService;

    @GetMapping("/public")
    public ResponseEntity<?> getPublicClasses(
            @PageableDefault(size = 12) Pageable pageable,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String sortByPrice,
            @RequestParam(required = false) String keyword
    ) {
        Page<ClassResponse> classes = classService.getPublicClasses(pageable, categoryId, sortByPrice, keyword);
        return ResponseEntity.ok(classes);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getClassById(@PathVariable Integer id) {
        ClassResponse clazz = classService.getClassById(id);
        return ResponseEntity.ok(clazz);
    }

    @GetMapping("/total")
    public ResponseEntity<?> getTotalCourses() {
        Long count = classService.getTotalClasses();
        return ResponseEntity.ok(Map.of(
                "totalClasses", count
        ));
    }

    @GetMapping("/admin/getAll")
    public ResponseEntity<?> getAllClasses(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer categoryId,
            @RequestParam(required = false) Integer instructorId,
            @RequestParam(required = false) Boolean status,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir
    ) {
        List<ClassResponse> classes = classService.getAllClasses(keyword, categoryId, instructorId, status, sortBy, sortDir);
        return ResponseEntity.ok(classes);
    }

    @PutMapping("/status/{id}")
    public ResponseEntity<?> updateStatus(@PathVariable Integer id) {
        classService.updateStatus(id);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/update/{id}")
    public ResponseEntity<?> updateClass(@PathVariable Integer id, @Valid @RequestPart(value = "data", required = false) UpdateClassRequest request, @RequestPart(value = "thumbnail", required = false) MultipartFile thumbnail) {
        classService.updateClass(id, request, thumbnail);
        return ResponseEntity.ok(Map.of(
                "message", "Updated Successfully!"
        ));
    }

    @GetMapping("/download-template")
    public ResponseEntity<?> downloadTemplate() throws IOException {
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Classes");

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
        String attention = "(DO NOT DELETE THIS LINE) ATTENTION: Each category must be separated by '|' when classes have more than 1 category. Date must be in correct format: dd-MM-yyyy";
        Cell attentionCell = attentionRow.createCell(0);
        attentionCell.setCellValue(attention);
        attentionCell.setCellStyle(attentionStyle);

        // Header row
        Row header = sheet.createRow(1);
        String[] headers = {"name", "listed_price", "sale_price", "categories", "instructor", "start_date", "end_date", "status"};
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

    @PostMapping("/create")
    public ResponseEntity<?> createClass(@Valid @RequestPart(value = "data", required = false) CreateClassRequest request, @RequestPart(value = "thumbnail", required = false) MultipartFile thumbnail) {
        classService.createClass(request, thumbnail);
        return ResponseEntity.ok(Map.of(
                "message", "Created Successfully!"
        ));
    }

    @PostMapping("/import")
    public ResponseEntity<?> importClasses(@RequestParam("file") MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "File is empty!"
            ));
        }

        ImportResponse response = classService.importClasses(file);
        return ResponseEntity.ok(response);
    }
}
