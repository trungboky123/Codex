package main.controller;

import lombok.RequiredArgsConstructor;
import main.dto.response.ChapterResponse;
import main.service.interfaces.IChapterService;
import main.service.interfaces.ILessonService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RequiredArgsConstructor
@RestController
@CrossOrigin("http://localhost:3000")
@RequestMapping("/chapters")
public class ChapterController {
    private final IChapterService chapterService;
    private final ILessonService lessonService;

    @GetMapping("/{id}")
    public ResponseEntity<?> getChaptersByCourseId(@PathVariable Integer id) {
        List<ChapterResponse> chapters = chapterService.getChaptersByCourseId(id);
        Long totalChapters = chapterService.getTotalChaptersByCourseId(id);
        Long totalLessons = 0L;
        for(ChapterResponse chapter : chapters) {
            totalLessons += lessonService.getTotalLessonsByChapterId(chapter.getId());
        }
        return ResponseEntity.ok(Map.of(
                "content", chapters,
                "totalChapters", totalChapters,
                "totalLessons", totalLessons
        ));
    }
}
