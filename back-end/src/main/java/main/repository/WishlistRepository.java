package main.repository;

import main.entity.User;
import main.entity.Wishlist;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface WishlistRepository extends JpaRepository<Wishlist, Long> {
    boolean existsByUserAndItemIdAndType(User user, Integer itemId, String type);
    Optional<Wishlist> findByUserAndItemIdAndType(User user, Integer itemId, String type);

    @Query("SELECT DISTINCT w FROM Wishlist w " +
            "WHERE w.user = :user " +
            "AND (:keyword IS NULL OR LOWER(w.itemName) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<Wishlist> findAllByUser(@Param("user") User user, @Param("keyword") String keyword, Sort sort);

    @Query("SELECT DISTINCT w FROM Wishlist w " +
            "WHERE w.user = :user " +
            "AND (:keyword IS NULL OR LOWER(w.itemName) LIKE LOWER(CONCAT('%', :keyword, '%')))" +
            "ORDER BY COALESCE(w.salePrice, w.listedPrice)")
    List<Wishlist> findAllByUserSortByPriceAsc(@Param("user") User user, @Param("keyword") String keyword);

    @Query("SELECT DISTINCT w FROM Wishlist w " +
            "WHERE w.user = :user " +
            "AND (:keyword IS NULL OR LOWER(w.itemName) LIKE LOWER(CONCAT('%', :keyword, '%')))" +
            "ORDER BY COALESCE(w.salePrice, w.listedPrice) DESC")
    List<Wishlist> findAllByUserSortByPriceDesc(@Param("user") User user, @Param("keyword") String keyword);
    void deleteByUserAndItemIdAndType(User user, Integer itemId, String type);
}
