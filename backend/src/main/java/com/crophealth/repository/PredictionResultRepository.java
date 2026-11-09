package com.crophealth.repository;

import com.crophealth.entity.CropAssessment;
import com.crophealth.entity.PredictionResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PredictionResultRepository extends JpaRepository<PredictionResult, Long> {
    Optional<PredictionResult> findByAssessment(CropAssessment assessment);
}
