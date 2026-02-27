package main.service.interfaces;

public interface IOtpService {
    void verifyOtp(String email, String code);
    void sendCode(String email);
}
