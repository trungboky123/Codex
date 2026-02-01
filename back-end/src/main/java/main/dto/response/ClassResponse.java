package main.dto.response;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
public class ClassResponse {
    private Integer id;
    private String name;
    private List<SettingResponse> categories;
    private BigDecimal listedPrice;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal salePrice;
    private String thumbnailUrl;
    private UserResponse instructor;
    private String description;
    private SyllabusResponse syllabus;
    private String slug;
    private boolean status;
}
