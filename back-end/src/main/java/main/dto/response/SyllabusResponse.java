package main.dto.response;

import lombok.Data;
import main.entity.DaysOfWeek;
import java.time.LocalTime;
import java.util.List;

@Data
public class SyllabusResponse {
    private LocalTime startTime;
    private LocalTime endTime;
    private int totalHours;
    private List<DaysOfWeek> daysOfWeek;
}
