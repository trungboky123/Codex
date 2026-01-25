package main.configuration;

import lombok.RequiredArgsConstructor;
import main.entity.User;
import main.repository.UserRepository;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {
    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String usernameOrEmail) throws UsernameNotFoundException {
        User user;

        if (usernameOrEmail.contains("@")) {
            user = userRepository.findByEmail(usernameOrEmail).orElseThrow(() -> new BadCredentialsException("Email not found"));
        } else {
            user = userRepository.findByUsername(usernameOrEmail).orElseThrow(() -> new BadCredentialsException("Username not found"));
        }

        return new CustomUserDetails(user);
    }
}
