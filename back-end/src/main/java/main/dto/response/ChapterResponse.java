package main.dto.response;

import lombok.Data;
import java.util.List;

@Data
public class ChapterResponse {
    private Integer id;
    private String name;
    private String description;
    private List<LessonResponse> lessons;
}
