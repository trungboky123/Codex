package main.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalTime;

@Entity
@Table(name = "syllabus")
@Data
public class Syllabus {
    @Id
    @Column(name = "syllabus_id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @OneToOne
    @JoinColumn(name = "class_id", nullable = false)
    private Class clazz;

    @Column(name = "total_hours", nullable = false)
    private int totalHours;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Column(name = "attendance", nullable = false)
    private int attendance;

    @Column(name = "assignments", nullable = false)
    private int assignments;

    @Column(name = "final_exam", nullable = false)
    private int finalExam;

    @Column(name = "objectives")
    private String objectives;
}
