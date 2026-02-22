package main.configuration;

import lombok.RequiredArgsConstructor;
import main.dto.request.RegisterRequest;
import main.repository.UserRepository;
import main.utils.PasswordUtil;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.stereotype.Service;

import java.util.Locale;

@Service
@RequiredArgsConstructor
public class RegisterCheckService {
    private final UserRepository userRepository;

    public void checkInfo(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("username.existed");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("email.existed");
        }

        if (!PasswordUtil.isValidPassword(request.getPassword())) {
            throw new RuntimeException("password.invalid");
        }
    }
}
