package com.crophealth.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "environmental_readings")
public class EnvironmentalReading {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assessment_id", nullable = false)
    private CropAssessment assessment;

    private Double temperature;

    @Column(name = "relative_humidity")
    private Double relativeHumidity;

    private Double rainfall;

    @Column(name = "solar_radiation")
    private Double solarRadiation;

    @Column(name = "wind_speed")
    private Double windSpeed;

    @Column(name = "is_user_provided", nullable = false)
    private Boolean isUserProvided = true;

    @Column(name = "recorded_at", nullable = false, updatable = false)
    private LocalDateTime recordedAt = LocalDateTime.now();

    public EnvironmentalReading() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public CropAssessment getAssessment() { return assessment; }
    public void setAssessment(CropAssessment assessment) { this.assessment = assessment; }

    public Double getTemperature() { return temperature; }
    public void setTemperature(Double temperature) { this.temperature = temperature; }

    public Double getRelativeHumidity() { return relativeHumidity; }
    public void setRelativeHumidity(Double relativeHumidity) { this.relativeHumidity = relativeHumidity; }

    public Double getRainfall() { return rainfall; }
    public void setRainfall(Double rainfall) { this.rainfall = rainfall; }

    public Double getSolarRadiation() { return solarRadiation; }
    public void setSolarRadiation(Double solarRadiation) { this.solarRadiation = solarRadiation; }

    public Double getWindSpeed() { return windSpeed; }
    public void setWindSpeed(Double windSpeed) { this.windSpeed = windSpeed; }

    public Boolean getIsUserProvided() { return isUserProvided; }
    public void setIsUserProvided(Boolean isUserProvided) { this.isUserProvided = isUserProvided; }

    public LocalDateTime getRecordedAt() { return recordedAt; }
    public void setRecordedAt(LocalDateTime recordedAt) { this.recordedAt = recordedAt; }
}
