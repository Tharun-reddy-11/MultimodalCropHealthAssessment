package com.crophealth.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "prediction_results")
public class PredictionResult {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assessment_id", nullable = false)
    private CropAssessment assessment;

    @Column(name = "predicted_class", nullable = false, length = 100)
    private String predictedClass;

    @Column(nullable = false)
    private Double confidence;

    @Column(name = "alternatives_json", columnDefinition = "TEXT")
    private String alternativesJson;

    @Column(length = 50)
    private String severity;

    @Column(name = "guidance_json", columnDefinition = "TEXT")
    private String guidanceJson;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public PredictionResult() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public CropAssessment getAssessment() { return assessment; }
    public void setAssessment(CropAssessment assessment) { this.assessment = assessment; }

    public String getPredictedClass() { return predictedClass; }
    public void setPredictedClass(String predictedClass) { this.predictedClass = predictedClass; }

    public Double getConfidence() { return confidence; }
    public void setConfidence(Double confidence) { this.confidence = confidence; }

    public String getAlternativesJson() { return alternativesJson; }
    public void setAlternativesJson(String alternativesJson) { this.alternativesJson = alternativesJson; }

    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }

    public String getGuidanceJson() { return guidanceJson; }
    public void setGuidanceJson(String guidanceJson) { this.guidanceJson = guidanceJson; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
