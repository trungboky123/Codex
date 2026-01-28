package main.service.interfaces;

import main.dto.response.ClassEnrollmentResponse;

import java.math.BigDecimal;
import java.util.List;

public interface IClassEnrollmentService {
    BigDecimal getTotalPrice();
    List<ClassEnrollmentResponse> getTopSoldClasses();
}
