package main.configuration;

import com.cloudinary.Cloudinary;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CloudinaryService {
    private final Cloudinary cloudinary;

    public String uploadUserAvatar(MultipartFile file, Integer userId) {
        try {
            if (file == null || file.isEmpty()) {
                return null;
            }

            String publicId = "user_" + userId;
            Map<String, Object> options = Map.of(
                    "public_id", publicId,
                    "overwrite", true,
                    "resource_type", "image",
                    "folder", "user_avt"
            );

            Map<?, ?> result = cloudinary.uploader().upload(file.getBytes(), options);

            return result.get("secure_url").toString();
        } catch (IOException e) {
            throw new RuntimeException("Upload avatar failed: " + e);
        }
    }

    public String uploadCourseThumbnail(MultipartFile file, Integer courseId) {
        try {
            if (file == null || file.isEmpty()) {
                return null;
            }

            String publicId = "course_" + courseId;
            Map<String, Object> options = Map.of(
                    "public_id", publicId,
                    "overwrite", true,
                    "resource_type", "image",
                    "folder", "course_thumbnail"
            );

            Map<?, ?> result = cloudinary.uploader().upload(file.getBytes(), options);

            return result.get("secure_url").toString();
        } catch (IOException e) {
            throw new RuntimeException("Upload thumbnail failed: " + e);
        }
    }

    public String uploadClassThumbnail(MultipartFile file, Integer classId) {
        try {
            if (file == null || file.isEmpty()) {
                return null;
            }

            String publicId = "class_" + classId;
            Map<String, Object> options = Map.of(
                    "public_id", publicId,
                    "overwrite", true,
                    "resource_type", "image",
                    "folder", "class_thumbnail"
            );

            Map<?, ?> result = cloudinary.uploader().upload(file.getBytes(), options);

            return result.get("secure_url").toString();
        } catch (IOException e) {
            throw new RuntimeException("Upload thumbnail failed: " + e);
        }
    }
}
