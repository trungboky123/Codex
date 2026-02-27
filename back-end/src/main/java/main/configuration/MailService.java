package main.configuration;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

@Service
@RequiredArgsConstructor
public class MailService {
    private final JavaMailSender javaMailSender;
    private final TemplateEngine templateEngine;

    public void sendCode(String toEmail, String code) {
        try {
            MimeMessage mimeMailMessage = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMailMessage, true, "UTF-8");

            helper.setTo(toEmail);
            helper.setSubject("Verification Code");
            helper.setText("Your verification code is " + code + ". Please don't show this code to anyone.");

            javaMailSender.send(mimeMailMessage);
        } catch (Exception e) {
            throw new RuntimeException("Sending email failed: " + e.getMessage());
        }
    }

    public void notifySale(String toEmail, String name, String type, String listedPrice, String salePrice, String thumbnailUrl) {
        try {
            MimeMessage mimeMailMessage = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMailMessage, true, "UTF-8");

            helper.setTo(toEmail);
            helper.setSubject("🎉 " + name + " is now on sale!");

            Context context = new Context();
            context.setVariable("name", name);
            context.setVariable("type", type);
            context.setVariable("listedPrice", listedPrice);
            context.setVariable("salePrice", salePrice);
            context.setVariable("thumbnailUrl", thumbnailUrl);

            String html = templateEngine.process("item-sale", context);
            helper.setText(html, true);

            javaMailSender.send(mimeMailMessage);
        } catch (Exception e) {
            throw new RuntimeException("Sending email failed: " + e.getMessage());
        }
    }

    public void purchaseSuccess(String toEmail, String username, String type, String itemName) {
        try {
            MimeMessage mimeMailMessage = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMailMessage, true, "UTF-8");

            helper.setTo(toEmail);
            helper.setSubject("Thank you for activating your product on CodeX!");

            Context context = new Context();
            context.setVariable("username", username);
            context.setVariable("type", type);
            context.setVariable("itemName", itemName);
            context.setVariable("email", toEmail);

            String html = templateEngine.process("item-purchase", context);
            helper.setText(html, true);

            javaMailSender.send(mimeMailMessage);
        } catch (Exception e) {
            throw new RuntimeException("Sending email failed: " + e.getMessage());
        }
    }
}
