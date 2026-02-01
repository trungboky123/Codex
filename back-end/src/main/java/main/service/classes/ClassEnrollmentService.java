package main.service.classes;

import lombok.RequiredArgsConstructor;
import main.dto.response.ClassEnrollmentResponse;
import main.dto.response.MonthlyRevenueResponse;
import main.entity.*;
import main.entity.Class;
import main.repository.ClassEnrollmentRepository;
import main.repository.ClassRepository;
import main.repository.UserRepository;
import main.service.interfaces.IClassEnrollmentService;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ClassEnrollmentService implements IClassEnrollmentService {
    private final ClassEnrollmentRepository classEnrollmentRepository;
    private final ClassRepository classRepository;
    private final UserRepository userRepository;

    @Override
    public BigDecimal getTotalPrice() {
        return classEnrollmentRepository.sumPricePaid();
    }

    @Override
    public List<ClassEnrollmentResponse> getTopSoldClasses() {
        return classEnrollmentRepository.getTopSoldClasses(PageRequest.of(0, 3));
    }

    @Override
    public List<MonthlyRevenueResponse> getMonthlyRevenue() {
        return classEnrollmentRepository.getMonthlyRevenue();
    }

    @Override
    public void enroll(User user, Integer itemId, Long amount) {
        Class clazz = classRepository.findById(itemId).orElseThrow(() -> new RuntimeException("Class not found!"));
        ClassEnrollment enrollment = new ClassEnrollment();
        enrollment.setClazz(clazz);
        enrollment.setUser(user);
        enrollment.setPricePaid(BigDecimal.valueOf(amount));
        enrollment.setEnrolledAt(LocalDateTime.now());
        enrollment.setPaymentMethod("QRPAY");
        enrollment.setStatus(true);

        classEnrollmentRepository.save(enrollment);
    }

    @Override
    public boolean hasEnrolled(Integer classId, Integer userId) {
        Class clazz = classRepository.findById(classId).orElseThrow(() -> new RuntimeException("Course not found!"));
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found!"));
        return classEnrollmentRepository.existsByClazzAndUser(clazz, user);
    }
}
