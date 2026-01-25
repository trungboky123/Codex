package main.service.interfaces;

import main.entity.Otp;

public interface IOtpService {
    String generateOtp();
    void saveOtp(Otp otp);
    void verifyOtp(String email, String code);
}
