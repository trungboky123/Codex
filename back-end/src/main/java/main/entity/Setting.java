package main.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.util.List;

@Entity
@Table(name = "setting")
@Data
public class Setting {
    @Id
    @Column(name = "setting_id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "setting_name", nullable = false, unique = true, length = 50)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "type_id")
    private Setting parent;

    @OneToMany(mappedBy = "parent")
    private List<Setting> children;

    @Column(name = "status")
    private boolean status;

    @OneToMany(mappedBy = "role")
    private List<User> users;

    @ManyToMany(mappedBy = "categories")
    private List<Class> classes;

    @ManyToMany(mappedBy = "categories")
    private List<Course> courses;
}
