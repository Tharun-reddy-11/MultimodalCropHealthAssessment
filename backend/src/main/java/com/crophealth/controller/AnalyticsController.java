package com.crophealth.controller;

import com.crophealth.dto.AssessmentDTOs.AnalyticsResponse;
import com.crophealth.dto.AssessmentDTOs.DashboardStats;
import com.crophealth.entity.CropAssessment;
import com.crophealth.entity.EnvironmentalReading;
import com.crophealth.entity.User;
import com.crophealth.repository.CropAssessmentRepository;
import com.crophealth.repository.EnvironmentalReadingRepository;
import com.crophealth.service.AssessmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {
    private final AssessmentService assessmentService;
    private final CropAssessmentRepository assessmentRepository;
    private final EnvironmentalReadingRepository envRepository;

    public AnalyticsController(
            AssessmentService assessmentService,
            CropAssessmentRepository assessmentRepository,
            EnvironmentalReadingRepository envRepository
    ) {
        this.assessmentService = assessmentService;
        this.assessmentRepository = assessmentRepository;
        this.envRepository = envRepository;
    }

    @GetMapping("/overview")
    public ResponseEntity<DashboardStats> getOverview(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(assessmentService.getDashboardStats(user));
    }

    @GetMapping("/charts")
    public ResponseEntity<AnalyticsResponse> getCharts(@AuthenticationPrincipal User user) {
        List<CropAssessment> list = assessmentRepository.findByUserOrderByCreatedAtDesc(user);

        AnalyticsResponse resp = new AnalyticsResponse();

        // 1. Disease Distribution
        Map<String, Long> diseaseDist = list.stream()
                .filter(a -> a.getPrediction() != null && !a.getPrediction().isBlank())
                .collect(Collectors.groupingBy(CropAssessment::getPrediction, Collectors.counting()));
        resp.diseaseDistribution = diseaseDist;

        // 2. Crop Distribution
        Map<String, Long> cropDist = list.stream()
                .collect(Collectors.groupingBy(CropAssessment::getCropType, Collectors.counting()));
        resp.cropDistribution = cropDist;

        // 3. Trends by month or day
        Map<String, Long> dateGrouped = list.stream()
                .collect(Collectors.groupingBy(a -> a.getObservationDate().toString(), TreeMap::new, Collectors.counting()));
        List<Map<String, Object>> trends = new ArrayList<>();
        dateGrouped.forEach((date, count) -> {
            trends.add(Map.of("date", date, "assessments", count));
        });
        resp.monthlyTrends = trends;

        // 4. Environmental readings correlations
        List<Map<String, Object>> envCorrelations = new ArrayList<>();
        for (CropAssessment a : list) {
            EnvironmentalReading env = envRepository.findByAssessment(a).orElse(null);
            if (env != null && env.getTemperature() != null && env.getRelativeHumidity() != null) {
                Map<String, Object> point = new HashMap<>();
                point.put("prediction", a.getPrediction() != null ? a.getPrediction() : "Healthy");
                point.put("temperature", env.getTemperature());
                point.put("humidity", env.getRelativeHumidity());
                point.put("rainfall", env.getRainfall() != null ? env.getRainfall() : 0.0);
                envCorrelations.add(point);
            }
        }
        resp.environmentalCorrelations = envCorrelations;

        return ResponseEntity.ok(resp);
    }
}
