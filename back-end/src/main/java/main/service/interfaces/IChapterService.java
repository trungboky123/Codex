package main.service.interfaces;

import main.dto.response.ChapterResponse;

import java.util.List;

public interface IChapterService {
    List<ChapterResponse> getChaptersByCourseId(Integer id);
    Long getTotalChaptersByCourseId(Integer id);
}
