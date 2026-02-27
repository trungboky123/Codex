package main.configuration;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

@Configuration
@EnableAsync
public class AsyncConfig {
    @Bean(name = "mailExecutor")
    public Executor mailExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(5);      // số thread chạy song song mặc định
        executor.setMaxPoolSize(10);      // tối đa
        executor.setQueueCapacity(100);   // số task chờ
        executor.setThreadNamePrefix("Mail-");

        executor.initialize();
        return executor;
    }

    @Bean(name = "codeExecutor")
    public Executor codeExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(5);      // số thread chạy song song mặc định
        executor.setMaxPoolSize(10);      // tối đa
        executor.setQueueCapacity(100);   // số task chờ
        executor.setThreadNamePrefix("Code-");

        executor.initialize();
        return executor;
    }

    @Bean(name = "purchaseExecutor")
    public Executor purchaseExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(5);      // số thread chạy song song mặc định
        executor.setMaxPoolSize(10);      // tối đa
        executor.setQueueCapacity(100);   // số task chờ
        executor.setThreadNamePrefix("Code-");

        executor.initialize();
        return executor;
    }
}
