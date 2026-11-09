package com.crophealth;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties
public class MultimodalCropHealthApplication {
    public static void main(String[] args) {
        SpringApplication.run(MultimodalCropHealthApplication.class, args);
    }
}
