package main.service.classes;

import com.github.slugify.Slugify;
import lombok.RequiredArgsConstructor;
import main.dto.response.ChapterResponse;
import main.dto.response.LessonResponse;
import main.repository.ChapterRepository;
import main.repository.LessonRepository;
import main.service.interfaces.IChapterService;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ChapterService implements IChapterService {
    private final ChapterRepository chapterRepository;
    private final ModelMapper modelMapper;
    private final Slugify slugify;

    @Override
    public List<ChapterResponse> getChaptersByCourseId(Integer id) {
        return chapterRepository.getChaptersByCourse_IdAndStatusTrue(id).stream().map(chapter -> {
            ChapterResponse response = modelMapper.map(chapter, ChapterResponse.class);
            response.setSlug(slugify.slugify(response.getName()));
            for (LessonResponse lesson : response.getLessons()) {
                lesson.setSlug(slugify.slugify(lesson.getName()));
            }
            return response;
        }).toList();
    }

    @Override
    public Long getTotalChaptersByCourseId(Integer id) {
        return chapterRepository.countByCourse_Id(id);
    }
}
