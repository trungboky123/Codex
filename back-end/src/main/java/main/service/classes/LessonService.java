package main.service.classes;

import com.github.slugify.Slugify;
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
    private final Slugify slugify;

    @Override
    public List<LessonResponse> getLessonsByChapterId(Integer id) {
        return lessonRepository.findAllByChapter_IdAndStatusTrue(id).stream().map(lesson -> {
            LessonResponse response = modelMapper.map(lesson, LessonResponse.class);
            response.setSlug(slugify.slugify(response.getName()));
            return response;
        }).toList();
    }

    @Override
    public Long getTotalLessonsByChapterId(Integer id) {
        return lessonRepository.countByChapter_IdAndStatusTrue(id);
    }
}
