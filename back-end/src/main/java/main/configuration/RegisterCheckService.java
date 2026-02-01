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
    private final MessageSource messageSource;

    public void checkInfo(RegisterRequest request) {
        Locale locale = LocaleContextHolder.getLocale();
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException(messageSource.getMessage("username.existed", null, locale));
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException(messageSource.getMessage("email.existed", null, locale));
        }

        if (!PasswordUtil.isValidPassword(request.getPassword())) {
            throw new RuntimeException(messageSource.getMessage("password.invalid", null, locale));
        }
    }
}
