package main.service.interfaces;

import main.dto.request.CreateUserRequest;
import main.dto.request.RegisterRequest;
import main.dto.request.UpdateUserRequest;
import main.dto.response.UserResponse;
import main.entity.User;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface IUserService {
    User getUserByUsername(String username);
    void register(RegisterRequest request);
    void updateMe(Integer userId, UpdateUserRequest request, MultipartFile avatar);
    Long getTotalUsers();
    List<UserResponse> getAllUsers(String keyword, Integer roleId, Boolean status, String sortBy, String sortDir);
    void updateStatus(Integer id);
    List<UserResponse> getAllInstructors();
    boolean findUserByEmail(String email);
    void resetPassword(String email, String code, String newPassword);
    UserResponse getUserById(Integer id);
    void updateUser(Integer id, UpdateUserRequest request, MultipartFile avatar);
    void createUser(CreateUserRequest request, MultipartFile avatar);
}
