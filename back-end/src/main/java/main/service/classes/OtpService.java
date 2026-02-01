package main.service.classes;

import lombok.RequiredArgsConstructor;
import main.entity.Otp;
import main.repository.OtpRepository;
import main.service.interfaces.IOtpService;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Locale;
import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
public class OtpService implements IOtpService {
    private final OtpRepository otpRepository;
    private final PasswordEncoder passwordEncoder;
    private final MessageSource messageSource;

    @Override
    public String generateOtp() {
        return String.valueOf(ThreadLocalRandom.current().nextInt(100000, 1000000));
    }

    @Override
    public void saveOtp(Otp otp) {
        otpRepository.save(otp);
    }

    @Override
    public void verifyOtp(String email, String code) {
        Locale locale = LocaleContextHolder.getLocale();
        Otp otp = otpRepository.findTopByEmailOrderByCreatedAtDesc(email).orElseThrow(() -> new RuntimeException(messageSource.getMessage("code.invalid", null, locale)));

        if (otp.isUsed()) {
            throw new RuntimeException(messageSource.getMessage("code.used", null, locale));
        }

        if (otp.getExpiredDate().isBefore(LocalDateTime.now())) {
            throw new RuntimeException(messageSource.getMessage("code.expired", null, locale));
        }

        if (!passwordEncoder.matches(code, otp.getOtpHash())) {
            throw new RuntimeException(messageSource.getMessage("code.incorrect", null, locale));
        }

        otp.setUsed(true);
        otpRepository.save(otp);
    }
}
