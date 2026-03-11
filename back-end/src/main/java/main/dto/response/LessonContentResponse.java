package main.dto.response;

import lombok.Data;

@Data
public class LessonContentResponse {
    private Integer id;
    private String name;
    private String slug;
    private String videoUrl;
    private String pdfUrl;
    private Boolean isPreview;
    private String content;
    private Boolean status;
}
