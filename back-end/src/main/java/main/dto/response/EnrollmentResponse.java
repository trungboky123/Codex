package main.dto.response;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class EnrollmentResponse {
    private Integer itemId;
    private String type;
    private String thumbnailUrl;
    private String name;
    private LocalDateTime enrolledAt;
    private List<String> categories;

    public EnrollmentResponse(Integer itemId, String type, String thumbnailUrl, String name, LocalDateTime enrolledAt) {
        this.itemId = itemId;
        this.type = type;
        this.thumbnailUrl = thumbnailUrl;
        this.name = name;
        this.enrolledAt = enrolledAt;
    }
}
