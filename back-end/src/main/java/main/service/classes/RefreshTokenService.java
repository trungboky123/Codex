package main.service.classes;

import lombok.RequiredArgsConstructor;
import main.entity.RefreshToken;
import main.entity.User;
import main.repository.RefreshTokenRepository;
import main.service.interfaces.IRefreshTokenService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RefreshTokenService implements IRefreshTokenService {
    private final RefreshTokenRepository refreshTokenRepository;

    @Value("${jwt.refresh-expiration}")
    private Long refreshExpiration;

    @Transactional
    @Override
    public RefreshToken createRefreshToken(User user) {
        RefreshToken token = refreshTokenRepository.findByUserId(user.getId()).orElse(new RefreshToken());

        token.setUser(user);
        token.setToken(UUID.randomUUID().toString());
        token.setExpiredDate(Instant.now().plusMillis(refreshExpiration));

        return refreshTokenRepository.save(token);
    }

    @Override
    public RefreshToken verifyExpiration(RefreshToken token) {
        if (token.getExpiredDate().isBefore(Instant.now())) {
            refreshTokenRepository.delete(token);
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,"Refresh token expired");
        }
        return token;
    }

    @Override
    public Optional<RefreshToken> findByToken(String token) {
        return refreshTokenRepository.findByToken(token);
    }

    @Transactional
    @Override
    public void deleteByToken(String token) {
        refreshTokenRepository.deleteByToken(token);
    }
}
