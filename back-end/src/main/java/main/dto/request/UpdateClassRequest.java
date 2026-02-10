package main.dto.request;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class UpdateClassRequest {
    private String name;
    private String listedPrice;
    private List<Integer> categoryIds;
    private String salePrice;
    private String thumbnailUrl;
    private Integer instructorId;
    private LocalDate startDate;
    private LocalDate endDate;
    private String description;
    private Boolean status;
}
