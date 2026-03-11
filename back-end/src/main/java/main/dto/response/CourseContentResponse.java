package main.dto.response;

import lombok.Data;

import java.util.List;

@Data
public class CourseContentResponse {
    private Integer id;
    private String name;
    private String thumbnailUrl;
    private UserResponse instructor;
    private int duration;
    private String description;
    private String slug;
    private boolean status;
    private List<ChapterContentResponse> chapters;
}
