package main.repository;

import main.entity.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Integer> {
    Optional<RefreshToken> findByUserId(Integer id);
    Optional<RefreshToken> findByToken(String token);
    @Modifying
    @Query("delete from RefreshToken rt where rt.token = :token")
    void deleteByToken(@Param("token") String token);
}
