package main.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "class")
@Data
public class Class {
    @Id
    @Column(name = "class_id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "class_name", nullable = false, unique = true, length = 50)
    private String name;

    @Column(name = "listed_price")
    private BigDecimal listedPrice;

    @Column(name = "sale_price")
    private BigDecimal salePrice;

    @Column(name = "thumbnail_url")
    private String thumbnailUrl;

    @Column(name = "number_of_students", nullable = false)
    private int numberOfStudents;

    @Column(name = "total_hours")
    private int totalHours;

    @ManyToOne
    @JoinColumn(name = "instructor_id")
    private User instructor;

    @Column(name = "status")
    private boolean status;

    @Column(name = "description")
    private String description;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(name = "record_url")
    private String recordUrl;

    @ManyToMany
    @JoinTable(
            name = "class_category",
            joinColumns = @JoinColumn(name = "class_id"),
            inverseJoinColumns = @JoinColumn(name = "category_id")
    )
    private List<Setting> categories;
}
