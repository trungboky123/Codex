package main.service.interfaces;

import main.dto.request.PaymentRequest;

import java.util.Map;

public interface IPaymentService {
    Map<String, Object> createPayment(Integer userId, PaymentRequest request);
    void handlePaid(Long orderCode);
}
