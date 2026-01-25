package main.configuration;

import lombok.RequiredArgsConstructor;
import main.dto.request.RegisterRequest;
import main.repository.UserRepository;
import main.utils.PasswordUtil;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RegisterCheckService {
    private final UserRepository userRepository;

    public void checkInfo(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username has already existed!");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email has already existed!");
        }

        if (!PasswordUtil.isValidPassword(request.getPassword())) {
            throw new RuntimeException("Password must contain at least 8 characters, 1 uppercase, 1 lowercase and 1 special characters");
        }
    }
}
