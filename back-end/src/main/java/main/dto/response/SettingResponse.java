package main.dto.response;

import lombok.Data;
import java.io.Serializable;

@Data
public class SettingResponse implements Serializable {
    private Integer id;
    private String name;
    private SettingResponse parent;
    private boolean status;
}
