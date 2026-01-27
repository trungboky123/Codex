package main.service.interfaces;

import main.dto.response.SyllabusResponse;

public interface ISyllabusService {
    SyllabusResponse findByClassId(Integer id);
}
