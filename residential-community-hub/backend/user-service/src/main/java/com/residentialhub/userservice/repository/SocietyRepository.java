package com.residentialhub.userservice.repository;

import com.residentialhub.userservice.entity.Society;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SocietyRepository extends JpaRepository<Society, String> {

    Optional<Society> findByName(String name);

    boolean existsByName(String name);

    @Query("SELECT s FROM Society s WHERE s.isActive = true")
    List<Society> findAllActive();

    @Query("SELECT s FROM Society s WHERE s.isActive = true")
    Page<Society> findAllActive(Pageable pageable);

    @Query("SELECT s FROM Society s WHERE s.owner.id = :ownerId")
    List<Society> findByOwnerId(@Param("ownerId") String ownerId);

    @Query("SELECT s FROM Society s WHERE s.subscriptionStatus = :status")
    List<Society> findBySubscriptionStatus(@Param("status") String status);

    @Query("SELECT s FROM Society s WHERE s.trialEndsAt < :date AND s.subscriptionStatus = 'TRIAL'")
    List<Society> findTrialsEndingBefore(@Param("date") LocalDateTime date);

    @Query("SELECT s FROM Society s WHERE s.subscriptionEndsAt < :date AND s.subscriptionStatus = 'ACTIVE'")
    List<Society> findSubscriptionsExpiringBefore(@Param("date") LocalDateTime date);

    @Query("SELECT COUNT(s) FROM Society s WHERE s.isActive = true")
    Long countActiveSocieties();

    @Query("SELECT COUNT(s) FROM Society s WHERE s.subscriptionStatus = :status")
    Long countBySubscriptionStatus(@Param("status") String status);

    @Query("SELECT s FROM Society s WHERE s.isVerified = true AND s.isActive = true")
    List<Society> findVerifiedAndActive();
}
