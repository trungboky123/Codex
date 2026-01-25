package main.service.interfaces;

import main.dto.request.RegisterRequest;
import main.dto.request.UpdateUserRequest;
import main.entity.User;

public interface IUserService {
    User getUserByUsername(String username);
    void register(RegisterRequest request);
    void updateMe(Integer userId, UpdateUserRequest request);
}
