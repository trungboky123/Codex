package main.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
@AllArgsConstructor
public class PaymentGroupResponse {
    private LocalDate date;
    private List<PaymentResponse> payments;
}
