package main.controller;

import lombok.RequiredArgsConstructor;
import main.dto.response.SyllabusResponse;
import main.service.interfaces.ISyllabusService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin("http://localhost:3000")
@RequiredArgsConstructor
@RequestMapping("/syllabus")
public class SyllabusController {
    private final ISyllabusService syllabusService;

    @GetMapping("/{id}")
    public ResponseEntity<?> getSyllabusByClassId(@PathVariable Integer id) {
        SyllabusResponse syllabus = syllabusService.findByClassId(id);
        return ResponseEntity.ok(syllabus);
    }
}
