package main.service.classes;

import lombok.RequiredArgsConstructor;
import main.entity.Otp;
import main.repository.OtpRepository;
import main.service.interfaces.IOtpService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
public class OtpService implements IOtpService {
    private final OtpRepository otpRepository;
    private final PasswordEncoder passwordEncoder;

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
        Otp otp = otpRepository.findTopByEmailOrderByCreatedAtDesc(email).orElseThrow(() -> new RuntimeException("Code is invalid"));

        if (otp.isUsed()) {
            throw new RuntimeException("Code has been used!");
        }

        if (otp.getExpiredDate().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Code has been expired! Please resend new code.");
        }

        if (!passwordEncoder.matches(code, otp.getOtpHash())) {
            throw new RuntimeException("Incorrect code!");
        }

        otp.setUsed(true);
        otpRepository.save(otp);
    }
}
