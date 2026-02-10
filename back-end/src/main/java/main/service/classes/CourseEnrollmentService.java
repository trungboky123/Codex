package main.service.classes;

import lombok.RequiredArgsConstructor;
import main.dto.response.CourseEnrollmentResponse;
import main.dto.response.MonthlyRevenueResponse;
import main.entity.Course;
import main.entity.CourseEnrollment;
import main.entity.User;
import main.repository.CourseEnrollmentRepository;
import main.repository.CourseRepository;
import main.repository.UserRepository;
import main.service.interfaces.ICourseEnrollmentService;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CourseEnrollmentService implements ICourseEnrollmentService {
    private final CourseEnrollmentRepository courseEnrollmentRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;

    @Override
    public BigDecimal getTotalPrice() {
        BigDecimal totalPrice = courseEnrollmentRepository.sumPricePaid();
        if (totalPrice == null) {
            return BigDecimal.ZERO;
        }
        return totalPrice;
    }

    @Override
    public List<CourseEnrollmentResponse> getTopSoldCourses() {
        return courseEnrollmentRepository.getTopSoldCourses(PageRequest.of(0 ,3));
    }

    @Override
    public List<MonthlyRevenueResponse> getMonthlyRevenue() {
        return courseEnrollmentRepository.getMonthlyRevenue();
    }

    @Override
    public void enroll(User user, Integer courseId, Long amount) {
        Course course = courseRepository.findById(courseId).orElseThrow(() -> new RuntimeException("Course not found!"));
        CourseEnrollment enrollment = new CourseEnrollment();
        enrollment.setCourse(course);
        enrollment.setUser(user);
        enrollment.setPricePaid(BigDecimal.valueOf(amount));
        enrollment.setEnrolledAt(LocalDateTime.now());
        enrollment.setPaymentMethod("QRPAY");
        enrollment.setStatus(true);

        courseEnrollmentRepository.save(enrollment);
    }

    @Override
    public boolean hasEnrolled(Integer courseId, Integer userId) {
        Course course = courseRepository.findById(courseId).orElseThrow(() -> new RuntimeException("Course not found!"));
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found!"));
        return courseEnrollmentRepository.existsByCourseAndUser(course, user);
    }

    @Override
    public void enrollFreeCourse(Integer userId, Integer courseId) {
        Course course = courseRepository.findById(courseId).orElseThrow(() -> new RuntimeException("Course not found"));
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found!"));
        if (course.getListedPrice() != null && course.getSalePrice() != null) {
            if (course.getListedPrice().compareTo(BigDecimal.ZERO) > 0 || course.getSalePrice().compareTo(BigDecimal.ZERO) > 0) {
                throw new RuntimeException("This course is not free!");
            }
        }

        if (course.getListedPrice() != null && course.getSalePrice() == null) {
            if (course.getListedPrice().compareTo(BigDecimal.ZERO) > 0) {
                throw new RuntimeException("This course is not free!");
            }
        }

        CourseEnrollment enrollment = new CourseEnrollment();
        enrollment.setCourse(course);
        enrollment.setUser(user);
        enrollment.setPricePaid(BigDecimal.ZERO);
        enrollment.setEnrolledAt(LocalDateTime.now());
        enrollment.setPaymentMethod("FREE");
        enrollment.setStatus(true);

        courseEnrollmentRepository.save(enrollment);
    }
}
