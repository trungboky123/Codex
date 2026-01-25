package main.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Entity
@Table(name = "course")
@Data
public class Course {
    @Id
    @Column(name = "course_id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "course_name", length = 50)
    private String name;

    @Column(name = "listed_price")
    private BigDecimal listedPrice;

    @Column(name = "sale_price")
    private BigDecimal salePrice;

    @Column(name = "thumbnail_url")
    private String thumbnailUrl;

    @ManyToOne
    @JoinColumn(name = "instructor_id")
    private User instructor;

    @Column(name = "duration")
    private int duration;

    @Column(name = "description")
    private String description;

    @Column(name = "status")
    private boolean status;

    @ManyToMany
    @JoinTable(
            name = "course_category",
            joinColumns = @JoinColumn(name = "course_id"),
            inverseJoinColumns = @JoinColumn(name = "category_id")
    )
    private List<Setting> categories;

    @OneToMany(mappedBy = "course")
    private List<Chapter> chapters;
}
