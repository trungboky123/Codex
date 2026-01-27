package main.service.classes;

import lombok.RequiredArgsConstructor;
import main.dto.response.SyllabusResponse;
import main.entity.Class;
import main.entity.Syllabus;
import main.repository.ClassRepository;
import main.repository.SyllabusRepository;
import main.service.interfaces.ISyllabusService;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SyllabusService implements ISyllabusService {
    private final SyllabusRepository syllabusRepository;
    private final ClassRepository classRepository;
    private final ModelMapper modelMapper;

    @Override
    public SyllabusResponse findByClassId(Integer id) {
        Class clazz = classRepository.findById(id).orElseThrow(() -> new RuntimeException("Class not found!"));
        Syllabus syllabus = syllabusRepository.findByClazz(clazz);
        return modelMapper.map(syllabus, SyllabusResponse.class);
    }
}
