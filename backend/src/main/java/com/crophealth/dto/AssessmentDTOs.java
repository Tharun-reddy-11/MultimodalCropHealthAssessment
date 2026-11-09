package com.crophealth.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public class AssessmentDTOs {

    public static class AssessmentResponse {
        public String id;
        public String cropType;
        public String plantId;
        public String growthStage;
        public LocalDate observationDate;
        public String imageUrl;
        public String gradcamUrl;
        public String originalFilename;
        public String inferenceMode;
        public String prediction;
        public Double confidence;
        public String confidencePercentage;
        public String status;
        public String modelVersion;
        public Double latencyMs;
        public String notes;
        public LocalDateTime createdAt;
        
        public EnvironmentalDto environmental;
        public PredictionDetailsDto predictionDetails;
    }

    public static class EnvironmentalDto {
        public Double temperature;
        public Double relativeHumidity;
        public Double rainfall;
        public Double solarRadiation;
        public Double windSpeed;
        public Boolean isUserProvided;
    }

    public static class PredictionDetailsDto {
        public String predictedClass;
        public Double confidence;
        public List<Map<String, Object>> alternatives;
        public String severity;
        public Map<String, Object> guidance;
    }

    public static class DashboardStats {
        public long totalAssessments;
        public long healthyCount;
        public long diseasedCount;
        public double healthRatioPercentage;
        public List<String> supportedCrops;
        public boolean modelReady;
        public String activeModelVersion;
        public List<AssessmentResponse> recentAssessments;
    }

    public static class AnalyticsResponse {
        public Map<String, Long> diseaseDistribution;
        public Map<String, Long> cropDistribution;
        public List<Map<String, Object>> monthlyTrends;
        public List<Map<String, Object>> environmentalCorrelations;
    }
}
