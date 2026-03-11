package main.dto.response;

import lombok.Data;

import java.util.List;

@Data
public class ChapterContentResponse {
    private Integer id;
    private String name;
    private String description;
    private String slug;
    private List<LessonContentResponse> lessons;
}
