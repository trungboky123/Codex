package main.repository;

import main.entity.Setting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SettingRepository extends JpaRepository<Setting, Integer> {
    Setting findByName(String name);
    List<Setting> findAllByParent_Name(String name);
}
