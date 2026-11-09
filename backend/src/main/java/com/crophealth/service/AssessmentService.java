package com.crophealth.service;

import com.crophealth.dto.AssessmentDTOs.*;
import com.crophealth.entity.*;
import com.crophealth.repository.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class AssessmentService {
    private final CropAssessmentRepository assessmentRepository;
    private final EnvironmentalReadingRepository envRepository;
    private final PredictionResultRepository predictionRepository;
    private final FileStorageService fileStorageService;
    private final MlClientService mlClientService;
    private final ObjectMapper objectMapper;

    public AssessmentService(
            CropAssessmentRepository assessmentRepository,
            EnvironmentalReadingRepository envRepository,
            PredictionResultRepository predictionRepository,
            FileStorageService fileStorageService,
            MlClientService mlClientService
    ) {
        this.assessmentRepository = assessmentRepository;
        this.envRepository = envRepository;
        this.predictionRepository = predictionRepository;
        this.fileStorageService = fileStorageService;
        this.mlClientService = mlClientService;
        this.objectMapper = new ObjectMapper();
    }

    @Transactional
    public AssessmentResponse createAssessment(
            User user,
            MultipartFile imageFile,
            String cropType,
            String plantId,
            String growthStage,
            String observationDateStr,
            String mode,
            Double temperature,
            Double relativeHumidity,
            Double rainfall,
            Double solarRadiation,
            Double windSpeed,
            String notes
    ) throws IOException {
        String aid = "ASSESS-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        String storedImagePath = fileStorageService.storeFile(imageFile, aid);

        LocalDate obsDate;
        try {
            obsDate = (observationDateStr != null && !observationDateStr.isBlank())
                    ? LocalDate.parse(observationDateStr)
                    : LocalDate.now();
        } catch (Exception e) {
            obsDate = LocalDate.now();
        }

        CropAssessment assessment = new CropAssessment();
        assessment.setId(aid);
        assessment.setUser(user);
        assessment.setCropType(cropType != null ? cropType : "Mango");
        assessment.setPlantId(plantId);
        assessment.setGrowthStage(growthStage);
        assessment.setObservationDate(obsDate);
        assessment.setImagePath(storedImagePath);
        assessment.setOriginalFilename(imageFile.getOriginalFilename());
        assessment.setInferenceMode(mode != null ? mode : "image");
        assessment.setNotes(notes);
        assessment.setStatus("PROCESSING");
        assessment.setCreatedAt(LocalDateTime.now());

        assessment = assessmentRepository.save(assessment);

        // Save environmental readings if provided
        EnvironmentalReading envReading = new EnvironmentalReading();
        envReading.setAssessment(assessment);
        envReading.setTemperature(temperature);
        envReading.setRelativeHumidity(relativeHumidity);
        envReading.setRainfall(rainfall);
        envReading.setSolarRadiation(solarRadiation);
        envReading.setWindSpeed(windSpeed);
        envReading.setIsUserProvided(true);
        envReading.setRecordedAt(LocalDateTime.now());
        envRepository.save(envReading);

        // Call ML Inference
        Map<String, Object> mlResult;
        try {
            mlResult = mlClientService.predict(
                    new File(storedImagePath),
                    mode,
                    cropType,
                    temperature,
                    relativeHumidity,
                    rainfall,
                    solarRadiation,
                    windSpeed
            );
        } catch (Exception e) {
            mlResult = mlClientService.executeResilientInference(
                    new File(storedImagePath),
                    mode,
                    cropType,
                    temperature,
                    relativeHumidity,
                    rainfall,
                    solarRadiation,
                    windSpeed
            );
        }

        String predictedClass = (String) mlResult.getOrDefault("prediction", "Unknown");
        Double confidence = ((Number) mlResult.getOrDefault("confidence", 0.0)).doubleValue();
        String modelVersion = (String) mlResult.getOrDefault("model_version", "v1.0");
        Double latencyMs = ((Number) mlResult.getOrDefault("inference_time_ms", 0.0)).doubleValue();
        String gradcamBase64 = (String) mlResult.get("gradcam_image_base64");

        String gradcamStoredPath = null;
        if (gradcamBase64 != null) {
            try {
                gradcamStoredPath = fileStorageService.storeBase64Image(gradcamBase64, aid);
            } catch (Exception ignored) {}
        }

        assessment.setPrediction(predictedClass);
        assessment.setConfidence(confidence);
        assessment.setModelVersion(modelVersion);
        assessment.setLatencyMs(latencyMs);
        assessment.setGradcamPath(gradcamStoredPath);
        assessment.setStatus("COMPLETED");
        assessmentRepository.save(assessment);

        // Save Prediction Result details
        PredictionResult predResult = new PredictionResult();
        predResult.setAssessment(assessment);
        predResult.setPredictedClass(predictedClass);
        predResult.setConfidence(confidence);

        Object alts = mlResult.get("alternatives");
        if (alts != null) {
            predResult.setAlternativesJson(objectMapper.writeValueAsString(alts));
        }

        Object guidance = mlResult.get("guidance");
        if (guidance instanceof Map<?, ?> gMap) {
            Object sev = gMap.get("severity");
            predResult.setSeverity(sev != null ? sev.toString() : "Moderate");
            predResult.setGuidanceJson(objectMapper.writeValueAsString(gMap));
        }

        predictionRepository.save(predResult);

        return toDto(assessment, envReading, predResult);
    }

    public Page<AssessmentResponse> getUserAssessments(
            User user,
            String query,
            String status,
            String cropType,
            int page,
            int size
    ) {
        PageRequest pr = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<CropAssessment> paged = assessmentRepository.searchAssessments(user, query, status, cropType, pr);
        return paged.map(a -> {
            EnvironmentalReading env = envRepository.findByAssessment(a).orElse(null);
            PredictionResult pred = predictionRepository.findByAssessment(a).orElse(null);
            return toDto(a, env, pred);
        });
    }

    public AssessmentResponse getAssessmentById(User user, String assessmentId) {
        CropAssessment a = assessmentRepository.findByIdAndUser(assessmentId, user)
                .orElseThrow(() -> new NoSuchElementException("Assessment not found or access denied"));
        EnvironmentalReading env = envRepository.findByAssessment(a).orElse(null);
        PredictionResult pred = predictionRepository.findByAssessment(a).orElse(null);
        return toDto(a, env, pred);
    }

    @Transactional
    public void deleteAssessment(User user, String assessmentId) {
        CropAssessment a = assessmentRepository.findByIdAndUser(assessmentId, user)
                .orElseThrow(() -> new NoSuchElementException("Assessment not found or access denied"));

        fileStorageService.deleteFileIfExists(a.getImagePath());
        fileStorageService.deleteFileIfExists(a.getGradcamPath());

        assessmentRepository.delete(a);
    }

    public DashboardStats getDashboardStats(User user) {
        DashboardStats stats = new DashboardStats();
        stats.totalAssessments = assessmentRepository.countByUser(user);
        stats.healthyCount = assessmentRepository.countHealthyByUser(user);
        stats.diseasedCount = assessmentRepository.countDiseasedByUser(user);
        stats.healthRatioPercentage = stats.totalAssessments > 0
                ? Math.round(((double) stats.healthyCount / stats.totalAssessments) * 1000.0) / 10.0
                : 100.0;
        stats.supportedCrops = List.of("Mango (Mangifera indica)", "Soybean (Glycine max)", "PlantDoc Foliage");

        Map<String, Object> mlHealth = mlClientService.checkHealth();
        stats.modelReady = "healthy".equalsIgnoreCase((String) mlHealth.get("status"));
        stats.activeModelVersion = "MobileNetV2-TransferLearning (Multimodal late fusion)";

        List<CropAssessment> top5 = assessmentRepository.findTop5ByUserOrderByCreatedAtDesc(user);
        stats.recentAssessments = top5.stream().map(a -> {
            EnvironmentalReading env = envRepository.findByAssessment(a).orElse(null);
            PredictionResult pred = predictionRepository.findByAssessment(a).orElse(null);
            return toDto(a, env, pred);
        }).toList();

        return stats;
    }

    public String generateCsvReport(User user, String assessmentId) {
        CropAssessment a = assessmentRepository.findByIdAndUser(assessmentId, user)
                .orElseThrow(() -> new NoSuchElementException("Assessment not found"));
        EnvironmentalReading env = envRepository.findByAssessment(a).orElse(new EnvironmentalReading());
        PredictionResult pred = predictionRepository.findByAssessment(a).orElse(new PredictionResult());

        StringBuilder sb = new StringBuilder();
        sb.append("FIELD,VALUE\n");
        sb.append("Assessment ID,").append(a.getId()).append("\n");
        sb.append("User,").append(user.getFullName()).append(" (").append(user.getEmail()).append(")\n");
        sb.append("Crop Type,").append(a.getCropType()).append("\n");
        sb.append("Plant ID,").append(a.getPlantId() != null ? a.getPlantId() : "N/A").append("\n");
        sb.append("Growth Stage,").append(a.getGrowthStage() != null ? a.getGrowthStage() : "N/A").append("\n");
        sb.append("Observation Date,").append(a.getObservationDate()).append("\n");
        sb.append("Inference Mode,").append(a.getInferenceMode()).append("\n");
        sb.append("Predicted Diagnosis,").append(a.getPrediction()).append("\n");
        sb.append("Model Confidence,").append(a.getConfidence() != null ? Math.round(a.getConfidence() * 100.0) + "%" : "N/A").append("\n");
        sb.append("Severity,").append(pred.getSeverity() != null ? pred.getSeverity() : "N/A").append("\n");
        sb.append("Model Version,").append(a.getModelVersion()).append("\n");
        sb.append("Inference Latency,").append(a.getLatencyMs()).append(" ms\n");
        sb.append("Temperature (C),").append(env.getTemperature() != null ? env.getTemperature() : "N/A").append("\n");
        sb.append("Relative Humidity (%),").append(env.getRelativeHumidity() != null ? env.getRelativeHumidity() : "N/A").append("\n");
        sb.append("Rainfall (mm),").append(env.getRainfall() != null ? env.getRainfall() : "N/A").append("\n");
        sb.append("Solar Radiation (W/m2),").append(env.getSolarRadiation() != null ? env.getSolarRadiation() : "N/A").append("\n");
        sb.append("Wind Speed (m/s),").append(env.getWindSpeed() != null ? env.getWindSpeed() : "N/A").append("\n");
        sb.append("Notes,").append(a.getNotes() != null ? a.getNotes().replace(",", " ") : "N/A").append("\n");
        sb.append("Report Generated At,").append(LocalDateTime.now()).append("\n");
        return sb.toString();
    }

    private AssessmentResponse toDto(CropAssessment a, EnvironmentalReading env, PredictionResult pred) {
        AssessmentResponse dto = new AssessmentResponse();
        dto.id = a.getId();
        dto.cropType = a.getCropType();
        dto.plantId = a.getPlantId();
        dto.growthStage = a.getGrowthStage();
        dto.observationDate = a.getObservationDate();
        dto.imageUrl = "/api/assessments/" + a.getId() + "/image";
        dto.gradcamUrl = a.getGradcamPath() != null ? "/api/assessments/" + a.getId() + "/gradcam" : null;
        dto.originalFilename = a.getOriginalFilename();
        dto.inferenceMode = a.getInferenceMode();
        dto.prediction = a.getPrediction();
        dto.confidence = a.getConfidence();
        dto.confidencePercentage = a.getConfidence() != null ? (Math.round(a.getConfidence() * 1000.0) / 10.0) + "%" : "—";
        dto.status = a.getStatus();
        dto.modelVersion = a.getModelVersion();
        dto.latencyMs = a.getLatencyMs();
        dto.notes = a.getNotes();
        dto.createdAt = a.getCreatedAt();

        if (env != null) {
            EnvironmentalDto eDto = new EnvironmentalDto();
            eDto.temperature = env.getTemperature();
            eDto.relativeHumidity = env.getRelativeHumidity();
            eDto.rainfall = env.getRainfall();
            eDto.solarRadiation = env.getSolarRadiation();
            eDto.windSpeed = env.getWindSpeed();
            eDto.isUserProvided = env.getIsUserProvided();
            dto.environmental = eDto;
        }

        if (pred != null) {
            PredictionDetailsDto pDto = new PredictionDetailsDto();
            pDto.predictedClass = pred.getPredictedClass();
            pDto.confidence = pred.getConfidence();
            pDto.severity = pred.getSeverity();
            try {
                if (pred.getAlternativesJson() != null) {
                    pDto.alternatives = objectMapper.readValue(pred.getAlternativesJson(), List.class);
                }
                if (pred.getGuidanceJson() != null) {
                    pDto.guidance = objectMapper.readValue(pred.getGuidanceJson(), Map.class);
                }
            } catch (Exception ignored) {}
            dto.predictionDetails = pDto;
        }

        return dto;
    }
}
