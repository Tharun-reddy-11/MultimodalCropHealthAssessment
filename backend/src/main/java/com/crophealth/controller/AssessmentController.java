package com.crophealth.controller;

import com.crophealth.dto.AssessmentDTOs.*;
import com.crophealth.entity.CropAssessment;
import com.crophealth.entity.User;
import com.crophealth.repository.CropAssessmentRepository;
import com.crophealth.service.AssessmentService;
import com.crophealth.service.FileStorageService;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/assessments")
public class AssessmentController {
    private final AssessmentService assessmentService;
    private final CropAssessmentRepository assessmentRepository;
    private final FileStorageService fileStorageService;

    public AssessmentController(
            AssessmentService assessmentService,
            CropAssessmentRepository assessmentRepository,
            FileStorageService fileStorageService
    ) {
        this.assessmentService = assessmentService;
        this.assessmentRepository = assessmentRepository;
        this.fileStorageService = fileStorageService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createAssessment(
            @AuthenticationPrincipal User user,
            @RequestParam("image") MultipartFile image,
            @RequestParam(value = "crop_type", defaultValue = "Mango") String cropType,
            @RequestParam(value = "plant_id", required = false) String plantId,
            @RequestParam(value = "growth_stage", required = false) String growthStage,
            @RequestParam(value = "observation_date", required = false) String observationDate,
            @RequestParam(value = "mode", defaultValue = "image") String mode,
            @RequestParam(value = "temperature", required = false) Double temperature,
            @RequestParam(value = "humidity", required = false) Double humidity,
            @RequestParam(value = "rainfall", required = false) Double rainfall,
            @RequestParam(value = "solar_radiation", required = false) Double solarRadiation,
            @RequestParam(value = "wind_speed", required = false) Double windSpeed,
            @RequestParam(value = "notes", required = false) String notes
    ) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Sign in required"));
        }

        if (image == null || image.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "A valid leaf image file is required."));
        }

        try {
            AssessmentResponse response = assessmentService.createAssessment(
                    user,
                    image,
                    cropType,
                    plantId,
                    growthStage,
                    observationDate,
                    mode,
                    temperature,
                    humidity,
                    rainfall,
                    solarRadiation,
                    windSpeed,
                    notes
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Assessment processing failed: " + e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<?> listAssessments(
            @AuthenticationPrincipal User user,
            @RequestParam(value = "q", required = false) String query,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "cropType", required = false) String cropType,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size
    ) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Sign in required"));
        }
        Page<AssessmentResponse> results = assessmentService.getUserAssessments(user, query, status, cropType, page, size);
        return ResponseEntity.ok(results);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getAssessment(
            @AuthenticationPrincipal User user,
            @PathVariable("id") String id
    ) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Sign in required"));
        }
        try {
            return ResponseEntity.ok(assessmentService.getAssessmentById(user, id));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAssessment(
            @AuthenticationPrincipal User user,
            @PathVariable("id") String id
    ) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Sign in required"));
        }
        try {
            assessmentService.deleteAssessment(user, id);
            return ResponseEntity.ok(Map.of("message", "Assessment successfully deleted", "id", id));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{id}/image")
    public ResponseEntity<Resource> serveImage(@PathVariable("id") String id) {
        CropAssessment a = assessmentRepository.findById(id).orElse(null);
        if (a == null || a.getImagePath() == null) {
            return ResponseEntity.notFound().build();
        }
        File f = new File(a.getImagePath());
        if (!f.exists()) {
            return ResponseEntity.notFound().build();
        }

        MediaType mediaType = MediaType.IMAGE_JPEG;
        if (f.getName().toLowerCase().endsWith(".png")) {
            mediaType = MediaType.IMAGE_PNG;
        }

        return ResponseEntity.ok()
                .contentType(mediaType)
                .body(new FileSystemResource(f));
    }

    @GetMapping("/{id}/gradcam")
    public ResponseEntity<Resource> serveGradcam(@PathVariable("id") String id) {
        CropAssessment a = assessmentRepository.findById(id).orElse(null);
        if (a == null || a.getGradcamPath() == null) {
            return ResponseEntity.notFound().build();
        }
        File f = new File(a.getGradcamPath());
        if (!f.exists()) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_PNG)
                .body(new FileSystemResource(f));
    }

    @GetMapping("/{id}/report/csv")
    public ResponseEntity<String> downloadCsvReport(
            @AuthenticationPrincipal User user,
            @PathVariable("id") String id
    ) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        try {
            String csv = assessmentService.generateCsvReport(user, id);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"assessment_" + id + ".csv\"")
                    .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                    .body(csv);
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
