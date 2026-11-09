package com.crophealth.repository;

import com.crophealth.entity.CropAssessment;
import com.crophealth.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CropAssessmentRepository extends JpaRepository<CropAssessment, String> {
    List<CropAssessment> findByUserOrderByCreatedAtDesc(User user);
    
    Optional<CropAssessment> findByIdAndUser(String id, User user);

    @Query("SELECT a FROM CropAssessment a WHERE a.user = :user AND " +
           "(:query IS NULL OR :query = '' OR LOWER(a.cropType) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(a.prediction) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(a.plantId) LIKE LOWER(CONCAT('%', :query, '%'))) AND " +
           "(:status IS NULL OR :status = '' OR a.status = :status) AND " +
           "(:cropType IS NULL OR :cropType = '' OR a.cropType = :cropType) " +
           "ORDER BY a.createdAt DESC")
    Page<CropAssessment> searchAssessments(
            @Param("user") User user,
            @Param("query") String query,
            @Param("status") String status,
            @Param("cropType") String cropType,
            Pageable pageable
    );

    long countByUser(User user);

    @Query("SELECT COUNT(a) FROM CropAssessment a WHERE a.user = :user AND LOWER(a.prediction) = 'healthy'")
    long countHealthyByUser(@Param("user") User user);

    @Query("SELECT COUNT(a) FROM CropAssessment a WHERE a.user = :user AND LOWER(a.prediction) != 'healthy' AND a.prediction IS NOT NULL")
    long countDiseasedByUser(@Param("user") User user);

    List<CropAssessment> findTop5ByUserOrderByCreatedAtDesc(User user);
}
