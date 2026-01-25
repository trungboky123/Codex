package main.controller;

import lombok.RequiredArgsConstructor;
import main.dto.response.LessonResponse;
import main.service.interfaces.ILessonService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequiredArgsConstructor
@RestController
@CrossOrigin("http://localhost:3000")
@RequestMapping("/lessons")
public class LessonController {
    private final ILessonService lessonService;

    @GetMapping("/{id}")
    public ResponseEntity<?> getLessonsByChapterId(@PathVariable Integer id) {
        List<LessonResponse> lessons = lessonService.getLessonsByChapterId(id);
        return ResponseEntity.ok(lessons);
    }
}
