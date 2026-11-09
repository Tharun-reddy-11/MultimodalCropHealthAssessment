-- Schema for Multimodal Crop Health Assessment Using Deep Learning in Greenhouse Environment
CREATE DATABASE IF NOT EXISTS multimodal_crop_health CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE multimodal_crop_health;

CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(190) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'USER',
    organization VARCHAR(120) DEFAULT 'Greenhouse Research Lab',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS crop_assessments (
    id VARCHAR(64) PRIMARY KEY,
    user_id BIGINT NOT NULL,
    crop_type VARCHAR(100) NOT NULL,
    plant_id VARCHAR(100),
    growth_stage VARCHAR(100),
    observation_date DATE NOT NULL,
    image_path VARCHAR(500) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    inference_mode VARCHAR(50) NOT NULL DEFAULT 'image',
    prediction VARCHAR(100),
    confidence DOUBLE,
    status VARCHAR(50) NOT NULL DEFAULT 'COMPLETED',
    model_version VARCHAR(100),
    latency_ms DOUBLE DEFAULT 0.0,
    gradcam_path VARCHAR(500),
    notes TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_assessment_user (user_id),
    INDEX idx_assessment_crop (crop_type),
    INDEX idx_assessment_date (observation_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS environmental_readings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    assessment_id VARCHAR(64) NOT NULL,
    temperature DOUBLE,
    relative_humidity DOUBLE,
    rainfall DOUBLE,
    solar_radiation DOUBLE,
    wind_speed DOUBLE,
    is_user_provided BOOLEAN NOT NULL DEFAULT TRUE,
    recorded_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assessment_id) REFERENCES crop_assessments(id) ON DELETE CASCADE,
    INDEX idx_env_assessment (assessment_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS prediction_results (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    assessment_id VARCHAR(64) NOT NULL,
    predicted_class VARCHAR(100) NOT NULL,
    confidence DOUBLE NOT NULL,
    alternatives_json TEXT,
    severity VARCHAR(50),
    guidance_json TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assessment_id) REFERENCES crop_assessments(id) ON DELETE CASCADE,
    INDEX idx_pred_assessment (assessment_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
