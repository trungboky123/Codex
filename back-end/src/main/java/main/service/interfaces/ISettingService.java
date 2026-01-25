package main.service.interfaces;

import main.dto.response.SettingResponse;
import java.util.List;

public interface ISettingService {
    List<SettingResponse> getAllCategories();
}
