package com.residentialhub.userservice.repository;

import com.residentialhub.userservice.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {

    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    Optional<User> findByUserId(String userId);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    boolean existsByUserId(String userId);

    @Query("SELECT u FROM User u WHERE u.society.id = :societyId AND u.isActive = true")
    List<User> findActiveUsersBySocietyId(@Param("societyId") String societyId);

    @Query("SELECT u FROM User u WHERE u.society.id = :societyId AND u.isActive = true")
    Page<User> findActiveUsersBySocietyId(@Param("societyId") String societyId, Pageable pageable);

    @Query("SELECT u FROM User u WHERE u.society.id = :societyId AND u.role = :role AND u.isActive = true")
    List<User> findBySocietyIdAndRole(@Param("societyId") String societyId, @Param("role") User.UserRole role);

    @Query("SELECT COUNT(u) FROM User u WHERE u.society.id = :societyId AND u.isActive = true")
    Long countActiveUsersBySocietyId(@Param("societyId") String societyId);

    @Query("SELECT COUNT(u) FROM User u WHERE u.society.id = :societyId AND u.role = 'RESIDENT' AND u.isActive = true")
    Long countResidentsBySocietyId(@Param("societyId") String societyId);

    @Query("SELECT u FROM User u WHERE u.role = 'PROJECT_OWNER'")
    List<User> findProjectOwners();

    Optional<User> findByRefreshToken(String refreshToken);

    @Query("SELECT u FROM User u WHERE u.society.id = :societyId AND u.buildingName = :buildingName AND u.isActive = true")
    List<User> findBySocietyIdAndBuildingName(@Param("societyId") String societyId, @Param("buildingName") String buildingName);
}
