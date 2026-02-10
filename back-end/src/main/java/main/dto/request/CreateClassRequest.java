package main.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class CreateClassRequest {
    @NotBlank(message = "Course name cannot be blank!")
    private String name;

    @NotBlank(message = "Listed Price cannot be blank!")
    private String listedPrice;
    private List<Integer> categoryIds;
    private String salePrice;
    private String thumbnailUrl;

    @NotNull(message = "Instructor cannot be blank!")
    private Integer instructorId;

    @NotNull(message = "Start Date cannot be blank!")
    private LocalDate startDate;

    @NotNull(message = "End Date cannot be blank!")
    private LocalDate endDate;
    private String description;
    private Boolean status;
}
