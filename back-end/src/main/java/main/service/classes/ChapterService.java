package main.service.classes;

import lombok.RequiredArgsConstructor;
import main.dto.response.ChapterResponse;
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

    @Override
    public List<ChapterResponse> getChaptersByCourseId(Integer id) {
        return chapterRepository.getChaptersByCourse_IdAndStatusTrue(id)
                .stream().map(chapter -> modelMapper.map(chapter, ChapterResponse.class)).toList();
    }

    @Override
    public Long getTotalChaptersByCourseId(Integer id) {
        return chapterRepository.countByCourse_Id(id);
    }
}
