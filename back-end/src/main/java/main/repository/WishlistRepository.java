package main.repository;

import main.entity.User;
import main.entity.Wishlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface WishlistRepository extends JpaRepository<Wishlist, Long> {
    boolean existsByUserAndItemIdAndType(User user, Integer itemId, String type);
    Optional<Wishlist> findByUserAndItemIdAndType(User user, Integer itemId, String type);
}
