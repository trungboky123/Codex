package main.dto.response;

import com.fasterxml.jackson.annotation.JsonTypeInfo;
import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.List;

@Data
public class CourseResponse implements Serializable {
    private Integer id;
    private String name;
    private BigDecimal listedPrice;
    private List<SettingResponse> categories;
    private BigDecimal salePrice;
    private String thumbnailUrl;
    private UserResponse instructor;
    private int duration;
    private String description;
    private String slug;
    private boolean status;
}
