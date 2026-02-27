package main.configuration;

import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

@Configuration
@EnableCaching
public class RedisConfig {
    @Bean
    public RedisCacheManager redisCacheManager(RedisConnectionFactory factory) {
        RedisCacheConfiguration defaultConfig = RedisCacheConfiguration.defaultCacheConfig().entryTtl(Duration.ofMinutes(30));

        Map<String, RedisCacheConfiguration> configs = new HashMap<>();
        configs.put("totalUsers", defaultConfig.entryTtl(Duration.ofMinutes(15)));
        configs.put("allUsers", defaultConfig.entryTtl(Duration.ofMinutes(15)));

        configs.put("allCourses", defaultConfig.entryTtl(Duration.ofMinutes(15)));
        configs.put("totalCourses", defaultConfig.entryTtl(Duration.ofMinutes(15)));

        configs.put("allClasses", defaultConfig.entryTtl(Duration.ofMinutes(15)));
        configs.put("totalClasses", defaultConfig.entryTtl(Duration.ofMinutes(15)));

        return RedisCacheManager.builder(factory)
                .cacheDefaults(defaultConfig)
                .withInitialCacheConfigurations(configs)
                .build();
    }
}
