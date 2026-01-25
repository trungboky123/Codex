package main.service.classes;

import lombok.RequiredArgsConstructor;
import main.dto.request.RegisterRequest;
import main.dto.request.UpdateUserRequest;
import main.entity.Setting;
import main.entity.User;
import main.repository.SettingRepository;
import main.repository.UserRepository;
import main.service.interfaces.IUserService;
import main.utils.PasswordUtil;
import org.modelmapper.ModelMapper;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService implements IUserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ModelMapper modelMapper;
    private final SettingRepository settingRepository;

    @Override
    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username).orElseThrow(() -> new UsernameNotFoundException("Username not found"));
    }

    @Override
    public void register(RegisterRequest request) {
        User user = modelMapper.map(request, User.class);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        Setting setting = settingRepository.findByName("Student");
        user.setRole(setting);
        user.setStatus(true);

        userRepository.save(user);
    }

    @Transactional
    @Override
    public void updateMe(Integer userId, UpdateUserRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        boolean updated = false;

        if (request.getFullName() != null) {
            if (request.getFullName().isBlank()) {
                throw new RuntimeException("Full name cannot be blank");
            }
            user.setFullName(request.getFullName());
            updated = true;
        }

        if (request.getUsername() != null) {
            if (request.getUsername().isBlank()) {
                throw new RuntimeException("Username cannot be blank");
            }
            user.setUsername(request.getUsername());
            updated = true;
        }

        if (request.getEmail() != null) {
            if (request.getEmail().isBlank()) {
                throw new RuntimeException("Email cannot be blank");
            }
            user.setEmail(request.getEmail());
            updated = true;
        }

        if (request.getNewPassword() != null) {
            if (request.getCurrentPassword() == null) {
                throw new RuntimeException("Current password is required");
            }

            if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
                throw new RuntimeException("Current password is wrong");
            }

            if (!PasswordUtil.isValidPassword(request.getNewPassword())) {
                throw new RuntimeException("Password must contain at least 8 characters, 1 uppercase, 1 lowercase and 1 special characters");
            }

            user.setPassword(passwordEncoder.encode(request.getNewPassword()));
            updated = true;
        }

        if (!updated) {
            throw new RuntimeException("No fields to update");
        }
        userRepository.save(user);
    }
}
