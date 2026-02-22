package main.controller;

import lombok.RequiredArgsConstructor;
import main.configuration.CustomUserDetails;
import main.configuration.PayosService;
import main.dto.request.PaymentRequest;
import main.dto.response.PaymentGroupResponse;
import main.entity.Payment;
import main.repository.PaymentRepository;
import main.service.interfaces.IPaymentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RequiredArgsConstructor
@RestController
@CrossOrigin("http://localhost:3000")
@RequestMapping("/payments")
public class PaymentController {
    private final IPaymentService paymentService;
    private final PayosService payosService;

    @PostMapping("/create")
    public ResponseEntity<?> createPayment(Authentication authentication, @RequestBody PaymentRequest request) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

        Map<String, Object> qr = paymentService.createPayment(userDetails.getId(), request);
        return ResponseEntity.ok(qr);
    }

    @GetMapping("/status/{orderCode}")
    public ResponseEntity<?> checkStatus(@PathVariable Long orderCode) {
        Map body = payosService.getPaymentRequest(orderCode);
        if (body == null || !"00".equals(String.valueOf(body.get("code")))) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Payment not found");
        }

        Map data = (Map) body.get("data");
        String status = String.valueOf(data.get("status"));

        if ("PAID".equalsIgnoreCase(status)) {
            paymentService.handlePaid(orderCode);
            return ResponseEntity.ok(Map.of("status", "PAID"));
        }

        return ResponseEntity.ok(Map.of("status", "PENDING"));
    }

    @GetMapping("/transaction-history")
    public ResponseEntity<?> getTransactionHistory(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

        List<PaymentGroupResponse> payments = paymentService.getPaymentsByUserId(userDetails.getId());
        return ResponseEntity.ok(payments);
    }
}
