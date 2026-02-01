package main.configuration;

import lombok.RequiredArgsConstructor;
import main.entity.Payment;
import main.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PayosService {

    @Value("${payos.client-id}")
    private String clientId;

    @Value("${payos.api-key}")
    private String apiKey;

    @Value("${payos.checksum-key}")
    private String checkSumKey;

    private final PaymentRepository paymentRepository;

    public Map<String, Object> createPayment(Payment payment) {
        RestTemplate restTemplate = new RestTemplate();

        String returnUrl = "https://localhost:3000/home";
        String cancelUrl = "https://localhost:3000/home";
        String description;
        if (payment.getItemType().equalsIgnoreCase("Course")) {
            description = "COURSE_" + payment.getOrderCode();
        } else {
            description = "CLASS_" + payment.getOrderCode();
        }

        String dataToSign = "amount=" + payment.getAmount() +
                "&cancelUrl=" + cancelUrl +
                "&description=" + description +
                "&orderCode=" + payment.getOrderCode() +
                "&returnUrl=" + returnUrl;

        String signature = createSignature(dataToSign, checkSumKey);

        // ===== payload =====
        Map<String, Object> payload = new HashMap<>();
        payload.put("orderCode", payment.getOrderCode());
        payload.put("amount", payment.getAmount());
        payload.put("description", description);
        payload.put("cancelUrl", cancelUrl);
        payload.put("returnUrl", returnUrl);
        payload.put("signature", signature);
        System.out.println(signature);

        // ===== headers =====
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-client-id", clientId);
        headers.set("x-api-key", apiKey);

        HttpEntity<Map<String, Object>> request =
                new HttpEntity<>(payload, headers);

        ResponseEntity<Map> response = restTemplate.postForEntity(
                "https://api-merchant.payos.vn/v2/payment-requests",
                request,
                Map.class
        );

        Map body = response.getBody();
        if (body == null || !"00".equals(String.valueOf(body.get("code")))) {
            throw new RuntimeException("Create PayOS payment failed: " + body);
        }

        System.out.println(body.get("signature"));
        Map data = (Map) body.get("data");

        return data;
    }

    public Map getPaymentRequest(Long orderCode) {
        RestTemplate restTemplate = new RestTemplate();
        String url = "https://api-merchant.payos.vn/v2/payment-requests/" + orderCode;

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-client-id", clientId);
        headers.set("x-api-key", apiKey);

        HttpEntity<Void> request = new HttpEntity<>(headers);

        ResponseEntity<Map> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                request,
                Map.class
        );

        return response.getBody();
    }

    private String createSignature(String data, String key) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKey =
                    new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKey);

            byte[] rawHmac = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));

            StringBuilder hex = new StringBuilder();
            for (byte b : rawHmac) {
                hex.append(String.format("%02x", b));
            }
            return hex.toString();

        } catch (Exception e) {
            throw new RuntimeException("Error creating signature", e);
        }
    }
}

