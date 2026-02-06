package main.dto.request;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class UpdateCourseRequest {
    private String name;
    private String listedPrice;
    private List<Integer> categoryIds;
    private String salePrice;
    private String thumbnailUrl;
    private Integer instructorId;
    private int duration;
    private String description;
    private Boolean status;
}
