package main.configuration;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity httpSecurity, UserDetailsService userDetailsService, JwtFilter jwtFilter) throws Exception {
        httpSecurity
                // Disable old function
                .csrf(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)
                // Cors
                .cors(Customizer.withDefaults())
                // Stateless
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                // Authorization
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/auth/login").permitAll()
                        .requestMatchers("/auth/register").permitAll()
                        .requestMatchers("/auth/refresh").permitAll()
                        .requestMatchers("/auth/logout").permitAll()
                        .requestMatchers("/auth/send-code").permitAll()
                        .requestMatchers("/auth/verify-code").permitAll()
                        .requestMatchers("/settings/categories").permitAll()
                        .requestMatchers("/courses/**").permitAll()
                        .requestMatchers("/classes/**").permitAll()
                        .requestMatchers("/chapters/**").permitAll()
                        .requestMatchers("/lessons/**").permitAll()
                        .requestMatchers("/users/total").hasRole("ADMIN")
                        .requestMatchers("/courses/total").hasRole("ADMIN")
                        .requestMatchers("/classes/total").hasRole("ADMIN")
                        .requestMatchers("/enrollments/total-revenue").hasRole("ADMIN")
                        .requestMatchers("/enrollments/top-courses").hasRole("ADMIN")
                        .requestMatchers("/enrollments/top-classes").hasRole("ADMIN")
                        .anyRequest().authenticated()
                )
                // UserDetailsService
                .userDetailsService(userDetailsService)
                // JwtFilter
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
        return httpSecurity.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration cors = new CorsConfiguration();
        cors.addAllowedOrigin("http://localhost:3000");
        cors.addAllowedMethod("*");
        cors.addAllowedHeader("*");
        cors.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", cors);
        return source;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
