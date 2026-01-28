package main.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "class_enrollment")
@Data
public class ClassEnrollment {
    @Id
    @Column(name = "enrollment_id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_id", nullable = false)
    private Class clazz;

    @Column(name = "price_paid")
    private BigDecimal pricePaid;

    @Column(name = "payment_method")
    private String paymentMethod;

    @Column(name = "enrolled_at")
    private LocalDateTime enrolledAt;

    @Column(name = "status")
    private boolean status;
}