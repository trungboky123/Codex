package main.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class StudentResponse {
    private Integer id;
    private String fullName;
    private String username;
    private String email;
    private List<String> courses;
    private List<String> classes;
    private Boolean status;
}
