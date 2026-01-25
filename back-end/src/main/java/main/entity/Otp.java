package main.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "otp")
@Data
public class Otp {
    @Id
    @Column(name = "otp_id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "email")
    private String email;

    @Column(name = "otp_hash", nullable = false)
    private String otpHash;

    @Column(name = "expired_date")
    private LocalDateTime expiredDate;

    @Column(name = "used")
    private boolean used;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
