package main.service.classes;

import lombok.RequiredArgsConstructor;
import main.dto.response.SettingResponse;
import main.entity.Setting;
import main.repository.SettingRepository;
import main.service.interfaces.ISettingService;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SettingService implements ISettingService {
    private final SettingRepository settingRepository;
    private final ModelMapper modelMapper;

    @Override
    public List<SettingResponse> getAllCategories() {
        List<Setting> categories = settingRepository.findAllByParent_Name("Category");
        return categories.stream().map(category -> modelMapper.map(category, SettingResponse.class)).toList();
    }

    @Override
    public List<SettingResponse> getAllRoles() {
        List<Setting> roles = settingRepository.findAllByParent_Name("Role");
        return roles.stream().map(role -> modelMapper.map(role, SettingResponse.class)).toList();
    }
}
