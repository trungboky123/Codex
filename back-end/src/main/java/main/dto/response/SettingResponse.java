package main.dto.response;

import lombok.Data;

@Data
public class SettingResponse {
    private Integer id;
    private String name;
    private SettingResponse parent;
    private boolean status;
}
