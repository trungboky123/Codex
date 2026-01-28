package main.dto.response;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class ClassEnrollmentResponse {
    private Integer classId;
    private String className;
    private String thumbnailUrl;
    private Long totalSold;
    private BigDecimal totalRevenue;

    public ClassEnrollmentResponse(Integer courseId, String courseName, String thumbnailUrl, Long totalSold, BigDecimal totalRevenue) {
        this.classId = courseId;
        this.className = courseName;
        this.thumbnailUrl = thumbnailUrl;
        this.totalSold = totalSold;
        this.totalRevenue = totalRevenue;
    }
}
