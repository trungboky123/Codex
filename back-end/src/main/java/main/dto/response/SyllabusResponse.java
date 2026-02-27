package main.dto.response;

import lombok.Data;
import main.entity.DaysOfWeek;

import java.io.Serializable;
import java.time.LocalTime;
import java.util.List;

@Data
public class SyllabusResponse implements Serializable {
    private LocalTime startTime;
    private LocalTime endTime;
    private int totalHours;
    private List<DaysOfWeek> daysOfWeek;
}
