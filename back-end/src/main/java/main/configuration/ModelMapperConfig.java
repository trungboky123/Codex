package main.configuration;

import main.dto.request.RegisterRequest;
import main.dto.response.ClassResponse;
import main.dto.response.CourseResponse;
import main.entity.Class;
import main.entity.Course;
import main.entity.User;
import org.modelmapper.ModelMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ModelMapperConfig {
    @Bean
    public ModelMapper modelMapper() {
        ModelMapper modelMapper = new ModelMapper();
        modelMapper.typeMap(RegisterRequest.class, User.class).addMappings(m -> m.skip(User::setPassword));

        return modelMapper;
    }
}
