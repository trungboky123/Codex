package main.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.List;

@Data
@AllArgsConstructor
public class ImportCourseResponse {
    private int total;
    private int success;
    private int failed;
    private List<String> errors;
}
