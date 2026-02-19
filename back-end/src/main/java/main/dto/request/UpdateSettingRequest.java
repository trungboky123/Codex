package main.dto.request;

import lombok.Data;

@Data
public class UpdateSettingRequest {
    private String name;
    private Integer typeId;
    private Boolean status;
}
