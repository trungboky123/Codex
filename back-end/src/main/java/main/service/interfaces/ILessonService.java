package main.service.interfaces;

import main.dto.response.LessonResponse;
import java.util.List;

public interface ILessonService {
    List<LessonResponse> getLessonsByChapterId(Integer id);
    Long getTotalLessonsByChapterId(Integer id);
}
