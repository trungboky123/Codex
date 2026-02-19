package main.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateSettingRequest {
    @NotBlank(message = "Setting name can not be blank!")
    private String name;
    private Integer typeId;
    private boolean status;
}
