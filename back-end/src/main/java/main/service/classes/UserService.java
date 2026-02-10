package main.service.classes;

import lombok.RequiredArgsConstructor;
import main.configuration.CloudinaryService;
import main.dto.request.CreateUserRequest;
import main.dto.request.RegisterRequest;
import main.dto.request.UpdateUserRequest;
import main.dto.response.ImportResponse;
import main.dto.response.UserResponse;
import main.entity.Otp;
import main.entity.Setting;
import main.entity.User;
import main.repository.OtpRepository;
import main.repository.SettingRepository;
import main.repository.UserRepository;
import main.service.interfaces.IUserService;
import main.utils.PasswordUtil;
import main.utils.XLSXUtil;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService implements IUserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ModelMapper modelMapper;
    private final CloudinaryService cloudinaryService;
    private final SettingRepository settingRepository;
    private final OtpRepository otpRepository;
    private static final String DEFAULT_AVATAR = "https://i.pinimg.com/736x/21/91/6e/21916e491ef0d796398f5724c313bbe7.jpg";

    @Override
    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username).orElseThrow(() -> new UsernameNotFoundException("Username not found"));
    }

    @Override
    public void register(RegisterRequest request) {
        User user = modelMapper.map(request, User.class);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        Setting setting = settingRepository.findByName("Student").orElseThrow(() -> new RuntimeException("Role not found!"));
        user.setAvatarUrl("https://i.pinimg.com/736x/21/91/6e/21916e491ef0d796398f5724c313bbe7.jpg");
        user.setRole(setting);
        user.setStatus(true);

        userRepository.save(user);
    }

    @Transactional
    @Override
    public void updateMe(Integer userId, UpdateUserRequest request, MultipartFile avatar) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        boolean updated = false;

        if (Boolean.TRUE.equals(request.getRemoveAvatar())) {
            user.setAvatarUrl(DEFAULT_AVATAR);
            updated = true;
        }

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

        if (avatar != null && !avatar.isEmpty()) {
            String avatarUrl = cloudinaryService.uploadUserAvatar(avatar, userId);
            user.setAvatarUrl(avatarUrl);
            updated = true;
        }

        if (!updated) {
            throw new RuntimeException("No fields to update");
        }
        userRepository.save(user);
    }

    @Override
    public Long getTotalUsers() {
        return userRepository.count();
    }

    @Override
    public List<UserResponse> getAllUsers(String keyword, Integer roleId, Boolean status, String sortBy, String sortDir) {
        Sort sort = Sort.by(sortDir.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC, sortBy);
        List<User> users = userRepository.findByFiltered(keyword, roleId, status, sort);
        return users.stream().map(user -> modelMapper.map(user, UserResponse.class)).toList();
    }

    @Transactional
    @Override
    public void updateStatus(Integer id) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found!"));
        user.setStatus(!user.isStatus());
    }

    @Override
    public List<UserResponse> getAllInstructors() {
        List<User> instructors = userRepository.findByRole_Name("Instructor");
        return instructors.stream().map(instructor -> modelMapper.map(instructor, UserResponse.class)).toList();
    }

    @Override
    public boolean findUserByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    @Override
    public void resetPassword(String email, String code, String newPassword) {
        Otp otp = otpRepository.findTopByEmailOrderByCreatedAtDesc(email).orElseThrow(() -> new RuntimeException("Otp not found!"));
        if (!passwordEncoder.matches(code, otp.getOtpHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }

        if (!PasswordUtil.isValidPassword(newPassword)) {
            throw new RuntimeException("Password must contain at least 8 characters, 1 uppercase, 1 lowercase and 1 special characters");
        }

        User user = userRepository.findByEmail(otp.getEmail()).orElseThrow(() -> new RuntimeException("User not found!"));
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    @Override
    public UserResponse getUserById(Integer id) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found!"));
        return modelMapper.map(user, UserResponse.class);
    }

    @Override
    public void updateUser(Integer id, UpdateUserRequest request, MultipartFile avatar) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));

        boolean updated = false;

        if (Boolean.TRUE.equals(request.getRemoveAvatar())) {
            user.setAvatarUrl(DEFAULT_AVATAR);
            updated = true;
        }

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

        if (avatar != null && !avatar.isEmpty()) {
            String avatarUrl = cloudinaryService.uploadUserAvatar(avatar, id);
            user.setAvatarUrl(avatarUrl);
            updated = true;
        }

        if (request.getRoleId() != null) {
            Setting role = settingRepository.findById(request.getRoleId()).orElseThrow(() -> new RuntimeException("Role not found!"));
            user.setRole(role);
            updated = true;
        }

        if (request.getStatus() != null) {
            user.setStatus(request.getStatus());
            updated = true;
        }

        if (!updated) {
            throw new RuntimeException("No fields to update");
        }
        userRepository.save(user);
    }

    @Override
    public void createUser(CreateUserRequest request, MultipartFile avatar) {
        User user = new User();
        user.setEmail(request.getEmail());
        user.setFullName(request.getFullName());
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode("12345678"));
        user.setStatus(request.getStatus());

        Setting role = settingRepository.findById(request.getRoleId()).orElseThrow(() -> new RuntimeException("Role not found!"));
        user.setRole(role);

        userRepository.save(user);

        String avatarUrl = cloudinaryService.uploadUserAvatar(avatar, user.getId());
        user.setAvatarUrl(avatarUrl);

        userRepository.save(user);
    }

    @Override
    public ImportResponse importAccounts(MultipartFile file) {
        int total = 0;
        int success = 0;
        List<String> errors = new ArrayList<>();

        try (Workbook workbook = WorkbookFactory.create(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;
                total++;

                try {
                    importSingleAccount(row);
                    success++;
                } catch (Exception e) {
                    errors.add("Row " + (i + 1) + ": " + e.getMessage());
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("Cannot read Excel file", e);
        }

        return new ImportResponse(total, success, total - success, errors);
    }

    private void importSingleAccount(Row row) {
        String fullName = XLSXUtil.getCell(row, 0);
        String username = XLSXUtil.getCell(row, 1);
        String email = XLSXUtil.getCell(row, 2);
        String roleName = XLSXUtil.getCell(row, 3);
        String password = XLSXUtil.getCell(row, 4);
        String statusStr = XLSXUtil.getCell(row, 5);

        if (fullName == null || fullName.isBlank()) {
            throw new RuntimeException("Full name is blank");
        }
        if (username == null || username.isBlank()) {
            throw new RuntimeException("Username is blank");
        }

        if (userRepository.existsByUsername(username)) {
            throw new RuntimeException("Username already exists");
        }

        if (email == null || email.isBlank()) {
            throw new RuntimeException("Email is blank!");
        }

        if (password == null || password.isBlank()) {
            throw new RuntimeException("Password is blank!");
        }

        if (!email.matches(".+@.+\\..+")) {
            throw new RuntimeException("Email is invalid!");
        }

        if (!PasswordUtil.isValidPassword(password)) {
            throw new RuntimeException("Password is invalid!");
        }

        if (roleName == null || roleName.isBlank()) {
            throw new RuntimeException("Role is blank!");
        }

        if (statusStr == null || statusStr.isBlank()) {
            throw new RuntimeException("Status is blank");
        }

        if (!statusStr.equalsIgnoreCase("true") &&
                !statusStr.equalsIgnoreCase("false")) {
            throw new RuntimeException("Status must be true/false!");
        }

        String roleStr = XLSXUtil.normalizeName(roleName);
        Setting role = settingRepository.findByName(roleStr).orElseThrow(() -> new RuntimeException("Role " + roleName + " not found"));

        User user = new User();
        user.setFullName(fullName);
        user.setUsername(username);
        user.setEmail(email);
        user.setRole(role);
        user.setAvatarUrl(DEFAULT_AVATAR);
        user.setPassword(passwordEncoder.encode(password));
        user.setStatus(Boolean.parseBoolean(statusStr));

        userRepository.save(user);
    }
}
