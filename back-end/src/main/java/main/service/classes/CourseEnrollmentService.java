package main.service.classes;

import lombok.RequiredArgsConstructor;
import main.dto.response.CourseEnrollmentResponse;
import main.repository.CourseEnrollmentRepository;
import main.service.interfaces.ICourseEnrollmentService;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CourseEnrollmentService implements ICourseEnrollmentService {
    private final CourseEnrollmentRepository courseEnrollmentRepository;

    @Override
    public BigDecimal getTotalPrice() {
        return courseEnrollmentRepository.sumPricePaid();
    }

    @Override
    public List<CourseEnrollmentResponse> getTopSoldCourses() {
        return courseEnrollmentRepository.getTopSoldCourses(PageRequest.of(0 ,3));
    }
}
