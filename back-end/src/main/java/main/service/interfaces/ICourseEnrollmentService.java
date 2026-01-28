package main.service.interfaces;

import main.dto.response.CourseEnrollmentResponse;

import java.math.BigDecimal;
import java.util.List;

public interface ICourseEnrollmentService {
    BigDecimal getTotalPrice();
    List<CourseEnrollmentResponse> getTopSoldCourses();
}
