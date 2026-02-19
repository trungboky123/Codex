package main.service.interfaces;

import main.dto.request.CreateSettingRequest;
import main.dto.request.UpdateSettingRequest;
import main.dto.response.SettingResponse;
import java.util.List;

public interface ISettingService {
    List<SettingResponse> getAllCategories();
    List<SettingResponse> getAllRoles();
    List<SettingResponse> findAllTypes();
    List<SettingResponse> getAllSettings(String keyword, Integer typeId, Boolean status, String sortBy, String sortDir);
    void updateStatus(Integer id);
    void create(CreateSettingRequest request);
    SettingResponse findById(Integer id);
    void updateSetting(Integer id, UpdateSettingRequest request);
}
