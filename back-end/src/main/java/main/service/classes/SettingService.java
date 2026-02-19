package main.service.classes;

import lombok.RequiredArgsConstructor;
import main.dto.request.CreateSettingRequest;
import main.dto.request.UpdateSettingRequest;
import main.dto.response.SettingResponse;
import main.entity.Setting;
import main.repository.SettingRepository;
import main.service.interfaces.ISettingService;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SettingService implements ISettingService {
    private final SettingRepository settingRepository;
    private final ModelMapper modelMapper;

    @Override
    public List<SettingResponse> getAllCategories() {
        List<Setting> categories = settingRepository.findAllByParent_NameAndStatusTrue("Category");
        return categories.stream().map(category -> modelMapper.map(category, SettingResponse.class)).toList();
    }

    @Override
    public List<SettingResponse> getAllRoles() {
        List<Setting> roles = settingRepository.findAllByParent_NameAndStatusTrue("Role");
        return roles.stream().map(role -> modelMapper.map(role, SettingResponse.class)).toList();
    }

    @Override
    public List<SettingResponse> findAllTypes() {
        List<Setting> setting = settingRepository.findByParentIsNullAndStatusTrue();
        return setting.stream().map(s -> modelMapper.map(s, SettingResponse.class)).toList();
    }

    @Override
    public List<SettingResponse> getAllSettings(String keyword, Integer typeId, Boolean status, String sortBy, String sortDir) {
        Sort sort = Sort.by(sortDir.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC, sortBy);
        List<Setting> settings = settingRepository.findAllSettings(keyword, typeId, status, sort);
        return settings.stream().map(s -> modelMapper.map(s, SettingResponse.class)).toList();
    }

    @Transactional
    @Override
    public void updateStatus(Integer id) {
        Setting setting = settingRepository.findById(id).orElseThrow(() -> new RuntimeException("Setting not found!"));
        if (setting.getName().equalsIgnoreCase("Role") || setting.getName().equalsIgnoreCase("Category")) {
            throw new RuntimeException("This setting cannot be deactivated!");
        }
        if (setting.getName().equalsIgnoreCase("Admin") || setting.getName().equalsIgnoreCase("Student") || setting.getName().equalsIgnoreCase("Instructor")) {
            throw new RuntimeException("This setting cannot be deactivated!");
        }
        setting.setStatus(!setting.isStatus());
    }

    @Override
    public void create(CreateSettingRequest request) {
        if (settingRepository.existsByName(request.getName())) {
            throw new RuntimeException("Setting name has already existed!");
        }

        Setting setting = new Setting();
        setting.setName(request.getName());

        if (request.getTypeId() != null) {
            Setting s = settingRepository.findById(request.getTypeId()).orElseThrow(() -> new RuntimeException("No type found!"));
            setting.setParent(s);
        }

        setting.setStatus(request.isStatus());

        settingRepository.save(setting);
    }

    @Override
    public SettingResponse findById(Integer id) {
        Setting setting = settingRepository.findById(id).orElseThrow(() -> new RuntimeException("Setting not found!"));
        return modelMapper.map(setting, SettingResponse.class);
    }

    @Transactional
    @Override
    public void updateSetting(Integer id, UpdateSettingRequest request) {
        if (request.getName().isBlank()) {
            throw new RuntimeException("Setting name cannot be blank!");
        }

        Setting setting = settingRepository.findById(id).orElseThrow(() -> new RuntimeException("Setting not found!"));
        boolean updated = false;

        if (setting.getName().equalsIgnoreCase("Role") || setting.getName().equalsIgnoreCase("Category")) {
            throw new RuntimeException("This setting cannot be changed!");
        }
        if (setting.getName().equalsIgnoreCase("Admin") || setting.getName().equalsIgnoreCase("Student") || setting.getName().equalsIgnoreCase("Instructor")) {
            throw new RuntimeException("This setting cannot be changed!");
        }

        if (request.getName() != null && !request.getName().isBlank()) {
            setting.setName(request.getName());
            updated = true;
        }

        if (request.getTypeId() != null) {
            Setting s = settingRepository.findById(request.getTypeId()).orElseThrow(() -> new RuntimeException("Type not found!"));
            setting.setParent(s);
            updated = true;
        }

        if (request.getStatus() != null) {
            setting.setStatus(request.getStatus());
            updated = true;
        }

        if (!updated) {
            throw new RuntimeException("No field to update!");
        }
    }
}
