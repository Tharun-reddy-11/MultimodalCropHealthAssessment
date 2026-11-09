package com.crophealth.repository;

import com.crophealth.entity.CropAssessment;
import com.crophealth.entity.EnvironmentalReading;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EnvironmentalReadingRepository extends JpaRepository<EnvironmentalReading, Long> {
    Optional<EnvironmentalReading> findByAssessment(CropAssessment assessment);
}
