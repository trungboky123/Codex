package main.configuration;

import lombok.Data;
import main.entity.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import java.util.Collection;
import java.util.List;

@Data
public class CustomUserDetails implements UserDetails {
    private Integer id;
    private String username;
    private String fullName;
    private String email;
    private String avatarUrl;
    private String password;
    private Collection<? extends GrantedAuthority> authorities;

    public CustomUserDetails(User user) {
        this.id = user.getId();
        this.username = user.getUsername();
        this.email = user.getEmail();
        this.fullName = user.getFullName();
        this.avatarUrl = user.getAvatarUrl();
        this.password = user.getPassword();
        this.authorities = List.of(
                new SimpleGrantedAuthority(
                        "ROLE_" + user.getRole().getName().toUpperCase()
                )
        );

    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }
}
