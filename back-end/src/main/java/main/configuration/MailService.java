package main.configuration;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MailService {
    private final JavaMailSender javaMailSender;

    public void sendCode(String toEmail, String code) {
        try {
            MimeMessage mimeMailMessage = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMailMessage, true, "UTF-8");

            helper.setTo(toEmail);
            helper.setSubject("Verification Code");
            helper.setText("Your verification code is " + code + ". Please don't show this code to anyone.");

            javaMailSender.send(mimeMailMessage);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
