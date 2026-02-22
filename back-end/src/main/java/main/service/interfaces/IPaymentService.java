package main.service.interfaces;

import main.dto.request.PaymentRequest;
import main.dto.response.PaymentGroupResponse;
import main.entity.Payment;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public interface IPaymentService {
    Map<String, Object> createPayment(Integer userId, PaymentRequest request);
    void handlePaid(Long orderCode);
    List<PaymentGroupResponse> getPaymentsByUserId(Integer userId);
}
