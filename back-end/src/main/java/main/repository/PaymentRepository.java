package main.repository;

import main.entity.Payment;
import main.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByOrderCode(Long orderCode);
    List<Payment> findByUserAndStatusOrderByPaidAtDesc(User user, String status);
}
