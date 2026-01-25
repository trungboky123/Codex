package main.service.interfaces;

import main.entity.RefreshToken;
import main.entity.User;
import java.util.Optional;

public interface IRefreshTokenService {
    RefreshToken createRefreshToken(User user);
    RefreshToken verifyExpiration(RefreshToken token);
    Optional<RefreshToken> findByToken(String token);
    void deleteByToken(String token);
}
