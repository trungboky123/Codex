package main.service.classes;

import lombok.RequiredArgsConstructor;
import main.dto.mail.CodeSender;
import main.entity.Otp;
import main.repository.OtpRepository;
import main.service.interfaces.IOtpService;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Locale;
import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
public class OtpService implements IOtpService {
    private final OtpRepository otpRepository;
    private final PasswordEncoder passwordEncoder;
    private final MessageSource messageSource;
    private final ApplicationEventPublisher eventPublisher;

    private String generateOtp() {
        return String.valueOf(ThreadLocalRandom.current().nextInt(100000, 1000000));
    }

    @Override
    @Transactional
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
            throw new RuntimeException("code.incorrect");
        }

        otp.setUsed(true);
    }

    @Override
    @Transactional
    public void sendCode(String email) {
        String code = generateOtp();
        String codeHashed = passwordEncoder.encode(code);

        Otp otp = new Otp();
        otp.setEmail(email);
        otp.setOtpHash(codeHashed);
        otp.setCreatedAt(LocalDateTime.now());
        otp.setExpiredDate(LocalDateTime.now().plusMinutes(5));

        otpRepository.save(otp);

        eventPublisher.publishEvent(new CodeSender(email, code));
    }
}
