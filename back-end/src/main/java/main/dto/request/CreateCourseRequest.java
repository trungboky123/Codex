package main.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class CreateCourseRequest {
    @NotBlank(message = "Course name cannot be blank!")
    private String name;

    @NotBlank(message = "Listed Price cannot be blank!")
    private String listedPrice;
    private List<Integer> categoryIds;
    private String salePrice;
    private String thumbnailUrl;

    @NotNull(message = "Instructor cannot be blank!")
    private Integer instructorId;
    private int duration;
    private String description;
    private Boolean status;
}
