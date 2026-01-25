package main.dto.response;

import lombok.Data;

@Data
public class LessonResponse {
    private Integer id;
    private String name;
    private int duration;
    private Boolean isPreview;
    private Boolean status;
}
