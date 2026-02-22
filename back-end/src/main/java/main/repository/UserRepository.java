package main.repository;

import main.entity.Setting;
import main.entity.User;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findByUsername(String username);
    Optional<User> findByFullName(String fullName);
    Optional<User> findByEmail(String email);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);

    @Query("SELECT DISTINCT u FROM User u " +
            "WHERE (:keyword IS NULL OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(u.username) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
            "AND (:roleId IS NULL OR u.role.id = :roleId) " +
            "AND (:status IS NULL OR u.status = :status)")
    List<User> findByFiltered(String keyword, Integer roleId, Boolean status, Sort sort);
    List<User> findByRole_Name(String name);
    Optional<User> findByFullNameAndRole(String fullName, Setting role);
}
