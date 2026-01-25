package main.repository;

import main.entity.Class;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ClassRepository extends JpaRepository<Class, Integer> {
    @Query("SELECT DISTINCT c from Class c " +
            "LEFT JOIN c.categories cat " +
            "WHERE (:categoryId IS NULL OR cat.id = :categoryId) " +
            "AND (:keyword IS NULL OR LOWER(c.name) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
            "ORDER BY COALESCE(c.salePrice, c.listedPrice) ")
    Page<Class> findByCategorySortByPriceAsc(@Param("categoryId") Long categoryId, @Param("keyword") String keyword, Pageable pageable);

    @Query("SELECT DISTINCT c from Class c " +
            "LEFT JOIN c.categories cat " +
            "WHERE (:categoryId IS NULL OR cat.id = :categoryId) " +
            "AND (:keyword IS NULL OR LOWER(c.name) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
            "ORDER BY COALESCE(c.salePrice, c.listedPrice) DESC ")
    Page<Class> findByCategorySortByPriceDesc(@Param("categoryId") Long categoryId, @Param("keyword") String keyword, Pageable pageable);

    @Query("SELECT DISTINCT c from Class c " +
            "LEFT JOIN c.categories cat " +
            "WHERE (:categoryId IS NULL OR cat.id = :categoryId) " +
            "AND (:keyword IS NULL OR LOWER(c.name) LIKE LOWER(CONCAT('%', :keyword, '%'))) ")
    Page<Class> findByFilter(
            @Param("categoryId") Long categoryId,
            @Param("keyword") String keyword,
            Pageable pageable
    );
}
