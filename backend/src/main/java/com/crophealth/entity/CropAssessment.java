package com.crophealth.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "crop_assessments")
public class CropAssessment {
    @Id
    @Column(length = 64)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "crop_type", nullable = false, length = 100)
    private String cropType;

    @Column(name = "plant_id", length = 100)
    private String plantId;

    @Column(name = "growth_stage", length = 100)
    private String growthStage;

    @Column(name = "observation_date", nullable = false)
    private LocalDate observationDate;

    @Column(name = "image_path", nullable = false, length = 500)
    private String imagePath;

    @Column(name = "original_filename", nullable = false)
    private String originalFilename;

    @Column(name = "inference_mode", nullable = false, length = 50)
    private String inferenceMode = "image";

    @Column(length = 100)
    private String prediction;

    private Double confidence;

    @Column(nullable = false, length = 50)
    private String status = "COMPLETED";

    @Column(name = "model_version", length = 100)
    private String modelVersion;

    @Column(name = "latency_ms")
    private Double latencyMs = 0.0;

    @Column(name = "gradcam_path", length = 500)
    private String gradcamPath;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public CropAssessment() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getCropType() { return cropType; }
    public void setCropType(String cropType) { this.cropType = cropType; }

    public String getPlantId() { return plantId; }
    public void setPlantId(String plantId) { this.plantId = plantId; }

    public String getGrowthStage() { return growthStage; }
    public void setGrowthStage(String growthStage) { this.growthStage = growthStage; }

    public LocalDate getObservationDate() { return observationDate; }
    public void setObservationDate(LocalDate observationDate) { this.observationDate = observationDate; }

    public String getImagePath() { return imagePath; }
    public void setImagePath(String imagePath) { this.imagePath = imagePath; }

    public String getOriginalFilename() { return originalFilename; }
    public void setOriginalFilename(String originalFilename) { this.originalFilename = originalFilename; }

    public String getInferenceMode() { return inferenceMode; }
    public void setInferenceMode(String inferenceMode) { this.inferenceMode = inferenceMode; }

    public String getPrediction() { return prediction; }
    public void setPrediction(String prediction) { this.prediction = prediction; }

    public Double getConfidence() { return confidence; }
    public void setConfidence(Double confidence) { this.confidence = confidence; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getModelVersion() { return modelVersion; }
    public void setModelVersion(String modelVersion) { this.modelVersion = modelVersion; }

    public Double getLatencyMs() { return latencyMs; }
    public void setLatencyMs(Double latencyMs) { this.latencyMs = latencyMs; }

    public String getGradcamPath() { return gradcamPath; }
    public void setGradcamPath(String gradcamPath) { this.gradcamPath = gradcamPath; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
