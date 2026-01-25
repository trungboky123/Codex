package main.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

@Entity
@Table(name = "user")
@Data
public class User {
    @Id
    @Column(name = "user_id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "fullname", nullable = false, length = 50)
    private String fullName;

    @Column(name = "username", nullable = false, unique = true, length = 50)
    private String username;

    @Column(name = "email", nullable = false, unique = true)
    private String email;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @ManyToOne
    @JoinColumn(name = "role_id")
    private Setting role;

    @Column(name = "password")
    private String password;

    @Column(name = "status")
    private boolean status;

    @Column(name = "remember_token")
    private String rememberToken;

    @OneToMany(mappedBy = "instructor")
    private List<Course> courses;

    @OneToMany(mappedBy = "instructor")
    private List<Course> classes;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private RefreshToken refreshToken;
}
