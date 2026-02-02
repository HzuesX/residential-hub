package com.residentialhub.visitorservice.repository;

import com.residentialhub.visitorservice.entity.Visitor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface VisitorRepository extends JpaRepository<Visitor, String> {

    @Query("SELECT v FROM Visitor v WHERE v.societyId = :societyId ORDER BY v.createdAt DESC")
    List<Visitor> findBySocietyId(@Param("societyId") String societyId);

    @Query("SELECT v FROM Visitor v WHERE v.societyId = :societyId ORDER BY v.createdAt DESC")
    Page<Visitor> findBySocietyId(@Param("societyId") String societyId, Pageable pageable);

    @Query("SELECT v FROM Visitor v WHERE v.societyId = :societyId AND v.status = :status ORDER BY v.createdAt DESC")
    List<Visitor> findBySocietyIdAndStatus(@Param("societyId") String societyId, @Param("status") Visitor.VisitorStatus status);

    @Query("SELECT v FROM Visitor v WHERE v.hostId = :hostId ORDER BY v.createdAt DESC")
    List<Visitor> findByHostId(@Param("hostId") String hostId);

    @Query("SELECT v FROM Visitor v WHERE v.societyId = :societyId AND v.entryTime >= :startOfDay AND v.entryTime < :endOfDay")
    List<Visitor> findTodayVisitors(@Param("societyId") String societyId, 
                                    @Param("startOfDay") LocalDateTime startOfDay, 
                                    @Param("endOfDay") LocalDateTime endOfDay);

    @Query("SELECT COUNT(v) FROM Visitor v WHERE v.societyId = :societyId AND v.status = :status")
    Long countBySocietyIdAndStatus(@Param("societyId") String societyId, @Param("status") Visitor.VisitorStatus status);

    @Query("SELECT COUNT(v) FROM Visitor v WHERE v.societyId = :societyId AND v.createdAt >= :startDate")
    Long countVisitorsSince(@Param("societyId") String societyId, @Param("startDate") LocalDateTime startDate);

    @Query("SELECT v FROM Visitor v WHERE v.societyId = :societyId AND (v.name LIKE %:search% OR v.phone LIKE %:search% OR v.purpose LIKE %:search%)")
    List<Visitor> searchVisitors(@Param("societyId") String societyId, @Param("search") String search);
}
