package main.dto.response;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class ClassResponse {
    private String name;
    private BigDecimal listedPrice;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal salePrice;
    private String thumbnailUrl;
    private UserResponse instructor;
    private int duration;
    private String description;
}
