package main.service.classes;

import lombok.RequiredArgsConstructor;
import main.dto.response.ClassEnrollmentResponse;
import main.repository.ClassEnrollmentRepository;
import main.service.interfaces.IClassEnrollmentService;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ClassEnrollmentService implements IClassEnrollmentService {
    private final ClassEnrollmentRepository classEnrollmentRepository;

    @Override
    public BigDecimal getTotalPrice() {
        return classEnrollmentRepository.sumPricePaid();
    }

    @Override
    public List<ClassEnrollmentResponse> getTopSoldClasses() {
        return classEnrollmentRepository.getTopSoldClasses(PageRequest.of(0, 3));
    }
}
