package main.service.classes;

import lombok.RequiredArgsConstructor;
import main.configuration.PayosService;
import main.dto.request.PaymentRequest;
import main.entity.Payment;
import main.entity.User;
import main.repository.PaymentRepository;
import main.repository.UserRepository;
import main.service.interfaces.IClassEnrollmentService;
import main.service.interfaces.ICourseEnrollmentService;
import main.service.interfaces.IPaymentService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
public class PaymentService implements IPaymentService {
    private final PaymentRepository paymentRepository;
    private final PayosService payosService;
    private final UserRepository userRepository;
    private final ICourseEnrollmentService courseEnrollmentService;
    private final IClassEnrollmentService classEnrollmentService;

    @Transactional
    @Override
    public Map<String, Object> createPayment(Integer userId, PaymentRequest request) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found!"));
        Payment payment = new Payment();
        payment.setOrderCode(ThreadLocalRandom.current().nextLong(100000, 1000000));
        payment.setUser(user);
        payment.setItemId(request.getItemId());
        payment.setItemType(request.getItemType());
        payment.setAmount(request.getAmount());
        payment.setStatus("Pending");
        payment.setCreatedAt(LocalDateTime.now());
        paymentRepository.save(payment);

        return payosService.createPayment(payment);
    }

    @Transactional
    public void handlePaid(Long orderCode) {
        Payment payment = paymentRepository.findByOrderCode(orderCode).orElseThrow(() -> new RuntimeException("Payment not found!"));
        if ("Paid".equalsIgnoreCase(payment.getStatus())) return;

        payment.setStatus("Paid");
        payment.setPaidAt(LocalDateTime.now());
        paymentRepository.save(payment);

        if ("Course".equals(payment.getItemType())) {
            courseEnrollmentService.enroll(
                    payment.getUser(),
                    payment.getItemId(),
                    payment.getAmount()
            );
        }

        if ("Class".equals(payment.getItemType())) {
            classEnrollmentService.enroll(
                    payment.getUser(),
                    payment.getItemId(),
                    payment.getAmount()
            );
        }
    }
}
