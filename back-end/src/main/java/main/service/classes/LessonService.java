package main.service.classes;

import lombok.RequiredArgsConstructor;
import main.dto.response.LessonResponse;
import main.repository.LessonRepository;
import main.service.interfaces.ILessonService;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LessonService implements ILessonService {
    private final LessonRepository lessonRepository;
    private final ModelMapper modelMapper;

    @Override
    public List<LessonResponse> getLessonsByChapterId(Integer id) {
        return lessonRepository.findAllByChapter_IdAndStatusTrue(id)
                .stream().map(lesson -> modelMapper.map(lesson, LessonResponse.class)).toList();
    }

    @Override
    public Long getTotalLessonsByChapterId(Integer id) {
        return lessonRepository.countByChapter_IdAndStatusTrue(id);
    }
}
