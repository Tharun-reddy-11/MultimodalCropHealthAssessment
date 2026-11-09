package com.crophealth.service;

import com.crophealth.config.JwtService;
import com.crophealth.dto.AuthDTOs.*;
import com.crophealth.entity.User;
import com.crophealth.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        String email = req.email.trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("An account with this email address already exists.");
        }

        if (!req.password.equals(req.confirmPassword)) {
            throw new IllegalArgumentException("Passwords do not match.");
        }

        if (req.password.length() < 8) {
            throw new IllegalArgumentException("Password must be at least 8 characters.");
        }

        User user = new User(
                req.fullName.trim(),
                email,
                passwordEncoder.encode(req.password),
                "USER",
                req.organization != null && !req.organization.isBlank() ? req.organization.trim() : "Farm Workspace"
        );
        user.setAvatar("farmer_1");

        user = userRepository.save(user);
        String token = jwtService.generateToken(user);
        UserSummary summary = new UserSummary(user.getId(), user.getFullName(), user.getEmail(), user.getRole(), user.getOrganization(), user.getAvatar());
        return new AuthResponse(token, summary);
    }

    public AuthResponse login(LoginRequest req) {
        String email = req.email.trim().toLowerCase();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password."));

        if (!passwordEncoder.matches(req.password, user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid email or password.");
        }

        String token = jwtService.generateToken(user);
        UserSummary summary = new UserSummary(user.getId(), user.getFullName(), user.getEmail(), user.getRole(), user.getOrganization(), user.getAvatar());
        return new AuthResponse(token, summary);
    }

    @Transactional
    public UserSummary updateProfile(User user, UpdateProfileRequest req) {
        User existing = userRepository.findById(user.getId())
                .orElseThrow(() -> new IllegalArgumentException("User not found."));

        if (req.fullName != null && !req.fullName.trim().isEmpty()) {
            existing.setFullName(req.fullName.trim());
        }
        if (req.avatar != null) {
            existing.setAvatar(req.avatar);
        }

        existing = userRepository.save(existing);
        return new UserSummary(existing.getId(), existing.getFullName(), existing.getEmail(), existing.getRole(), existing.getOrganization(), existing.getAvatar());
    }

    @Transactional
    public void updatePassword(User user, UpdatePasswordRequest req) {
        User existing = userRepository.findById(user.getId())
                .orElseThrow(() -> new IllegalArgumentException("User not found."));

        if (!passwordEncoder.matches(req.currentPassword, existing.getPasswordHash())) {
            throw new IllegalArgumentException("Current password is incorrect.");
        }

        if (!req.newPassword.equals(req.confirmPassword)) {
            throw new IllegalArgumentException("New passwords do not match.");
        }

        if (req.newPassword.length() < 8) {
            throw new IllegalArgumentException("New password must be at least 8 characters long.");
        }

        existing.setPasswordHash(passwordEncoder.encode(req.newPassword));
        userRepository.save(existing);
    }

    public UserSummary getCurrentUser(User user) {
        User existing = userRepository.findById(user.getId()).orElse(user);
        return new UserSummary(existing.getId(), existing.getFullName(), existing.getEmail(), existing.getRole(), existing.getOrganization(), existing.getAvatar());
    }
}
