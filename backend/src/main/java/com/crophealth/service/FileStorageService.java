package com.crophealth.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Base64;
import java.util.UUID;

@Service
public class FileStorageService {
    private final Path rootUploadPath;

    public FileStorageService(@Value("${app.upload-dir:storage/uploads}") String uploadDir) {
        this.rootUploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.rootUploadPath);
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directory", e);
        }
    }

    public String storeFile(MultipartFile file, String prefix) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Cannot store empty file");
        }

        String originalFilename = file.getOriginalFilename();
        String extension = ".jpg";
        if (originalFilename != null && originalFilename.lastIndexOf('.') > 0) {
            String ext = originalFilename.substring(originalFilename.lastIndexOf('.')).toLowerCase();
            if (ext.equals(".png") || ext.equals(".jpeg") || ext.equals(".jpg")) {
                extension = ext;
            }
        }

        String filename = prefix + "_" + UUID.randomUUID().toString().replace("-", "") + extension;
        Path destination = this.rootUploadPath.resolve(filename).normalize();

        if (!destination.startsWith(this.rootUploadPath)) {
            throw new SecurityException("Cannot store file outside target directory");
        }

        try (InputStream inputStream = file.getInputStream()) {
            Files.copy(inputStream, destination, StandardCopyOption.REPLACE_EXISTING);
        }

        return destination.toString();
    }

    public String storeBase64Image(String base64Data, String prefix) throws IOException {
        if (base64Data == null || !base64Data.contains(",")) {
            return null;
        }

        String pureBase64 = base64Data.substring(base64Data.indexOf(",") + 1);
        byte[] decodedBytes = Base64.getDecoder().decode(pureBase64);

        String filename = prefix + "_gradcam_" + UUID.randomUUID().toString().replace("-", "") + ".png";
        Path destination = this.rootUploadPath.resolve(filename).normalize();

        Files.write(destination, decodedBytes);
        return destination.toString();
    }

    public Path loadFile(String filePath) {
        return Paths.get(filePath);
    }

    public void deleteFileIfExists(String filePath) {
        if (filePath != null) {
            try {
                Path p = Paths.get(filePath);
                Files.deleteIfExists(p);
            } catch (Exception ignored) {}
        }
    }
}
