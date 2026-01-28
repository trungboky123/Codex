package main.dto.response;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class CourseEnrollmentResponse {
    private Integer courseId;
    private String courseName;
    private String thumbnailUrl;
    private Long totalSold;
    private BigDecimal totalRevenue;

    public CourseEnrollmentResponse(Integer courseId, String courseName, String thumbnailUrl, Long totalSold, BigDecimal totalRevenue) {
        this.courseId = courseId;
        this.courseName = courseName;
        this.thumbnailUrl = thumbnailUrl;
        this.totalSold = totalSold;
        this.totalRevenue = totalRevenue;
    }
}
