package main.service.classes;

import lombok.RequiredArgsConstructor;
import main.configuration.PayosService;
import main.dto.request.PaymentRequest;
import main.dto.response.PaymentGroupResponse;
import main.dto.response.PaymentResponse;
import main.entity.Class;
import main.entity.Course;
import main.entity.Payment;
import main.entity.User;
import main.repository.ClassRepository;
import main.repository.CourseRepository;
import main.repository.PaymentRepository;
import main.repository.UserRepository;
import main.service.interfaces.IClassEnrollmentService;
import main.service.interfaces.ICourseEnrollmentService;
import main.service.interfaces.IPaymentService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PaymentService implements IPaymentService {
    private final PaymentRepository paymentRepository;
    private final PayosService payosService;
    private final UserRepository userRepository;
    private final ICourseEnrollmentService courseEnrollmentService;
    private final IClassEnrollmentService classEnrollmentService;
    private final CourseRepository courseRepository;
    private final ClassRepository classRepository;

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

    @Override
    public List<PaymentGroupResponse> getPaymentsByUserId(Integer userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found!"));
        List<Payment> payments = paymentRepository.findByUserAndStatusOrderByPaidAtDesc(user, "Paid");

        if (payments.isEmpty()) {
            return List.of();
        }

        List<Integer> courseIds = payments.stream()
                .filter(p -> "Course".equalsIgnoreCase(p.getItemType()))
                .map(Payment::getItemId)
                .distinct()
                .toList();

        List<Integer> classIds = payments.stream()
                .filter(p -> "Class".equalsIgnoreCase(p.getItemType()))
                .map(Payment::getItemId)
                .distinct()
                .toList();

        Map<Integer, Course> courseMap = courseIds.isEmpty()
                ? Map.of()
                : courseRepository.findAllById(courseIds).stream().collect(Collectors.toMap(Course::getId, c -> c));

        Map<Integer, Class> classMap = classIds.isEmpty()
                ? Map.of()
                : classRepository.findAllById(classIds).stream().collect(Collectors.toMap(Class::getId, c -> c));

        List<PaymentResponse> responses = payments.stream()
                .map(p -> {
                    String name = null;
                    String thumbnailUrl = null;

                    if ("Course".equalsIgnoreCase(p.getItemType())) {
                        Course course = courseMap.get(p.getItemId());
                        if (course != null) {
                            name = course.getName();
                            thumbnailUrl = course.getThumbnailUrl();
                        }
                    }

                    if ("Class".equalsIgnoreCase(p.getItemType())) {
                        Class clazz = classMap.get(p.getItemId());
                        if (clazz != null) {
                            name = clazz.getName();
                            thumbnailUrl = clazz.getThumbnailUrl();
                        }
                    }

                    return new PaymentResponse(
                            p.getItemType(),
                            p.getItemId(),
                            name,
                            thumbnailUrl,
                            p.getAmount(),
                            p.getStatus(),
                            p.getPaidAt()
                    );
                }).toList();

        Map<LocalDate, List<PaymentResponse>> grouped =
                responses.stream()
                        .collect(Collectors.groupingBy(
                                p -> p.getPaidAt().toLocalDate(),
                                LinkedHashMap::new,
                                Collectors.toList()
                        ));

        return grouped.entrySet()
                .stream()
                .map(entry -> new PaymentGroupResponse(
                        entry.getKey(),
                        entry.getValue()
                )).toList();
    }
}
