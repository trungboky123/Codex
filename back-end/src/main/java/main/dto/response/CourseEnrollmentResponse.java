package main.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class CourseEnrollmentResponse {
    private Integer courseId;
    private String courseName;
    private String thumbnailUrl;
    private Long totalSold;
    private BigDecimal totalRevenue;
}
