package main.service.interfaces;

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
    List<UserResponse> getAllUsers(String keyword, Integer roleId, Boolean status);
    void updateStatus(Integer id);
    List<UserResponse> getAllInstructors();
}
