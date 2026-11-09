package com.crophealth.controller;

import com.crophealth.service.MlClientService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class ModelController {
    private final MlClientService mlClientService;

    public ModelController(MlClientService mlClientService) {
        this.mlClientService = mlClientService;
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "backend", "Spring Boot 3.4.5",
                "database", "MySQL Connected",
                "mlService", mlClientService.checkHealth()
        ));
    }

    @GetMapping("/model/status")
    public ResponseEntity<Map<String, Object>> getModelStatus() {
        return ResponseEntity.ok(mlClientService.checkHealth());
    }

    @GetMapping("/model/metrics")
    public ResponseEntity<Map<String, Object>> getModelMetrics() {
        return ResponseEntity.ok(mlClientService.getMetrics());
    }

    @GetMapping("/datasets/info")
    public ResponseEntity<Map<String, Object>> getDatasetInfo() {
        return ResponseEntity.ok(mlClientService.getDatasetManifest());
    }
}
