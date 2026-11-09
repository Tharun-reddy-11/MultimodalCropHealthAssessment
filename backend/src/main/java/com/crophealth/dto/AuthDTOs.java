package com.crophealth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AuthDTOs {

    public static class RegisterRequest {
        @NotBlank(message = "Full name is required")
        @Size(min = 2, max = 120, message = "Full name must be between 2 and 120 characters")
        public String fullName;

        @NotBlank(message = "Email address is required")
        @Email(message = "Enter a valid email address")
        public String email;

        @NotBlank(message = "Password is required")
        @Size(min = 8, message = "Password must be at least 8 characters")
        public String password;

        @NotBlank(message = "Confirm password is required")
        public String confirmPassword;

        public String organization;
    }

    public static class LoginRequest {
        @NotBlank(message = "Email address is required")
        @Email(message = "Enter a valid email address")
        public String email;

        @NotBlank(message = "Password is required")
        public String password;
    }

    public static class UpdateProfileRequest {
        public String fullName;
        public String avatar;
    }

    public static class UpdatePasswordRequest {
        @NotBlank(message = "Current password is required")
        public String currentPassword;

        @NotBlank(message = "New password is required")
        @Size(min = 8, message = "New password must be at least 8 characters")
        public String newPassword;

        @NotBlank(message = "Confirm password is required")
        public String confirmPassword;
    }

    public static class AuthResponse {
        public String token;
        public UserSummary user;

        public AuthResponse(String token, UserSummary user) {
            this.token = token;
            this.user = user;
        }
    }

    public static class UserSummary {
        public Long id;
        public String fullName;
        public String email;
        public String role;
        public String organization;
        public String avatar;

        public UserSummary(Long id, String fullName, String email, String role, String organization, String avatar) {
            this.id = id;
            this.fullName = fullName;
            this.email = email;
            this.role = role;
            this.organization = organization;
            this.avatar = avatar;
        }
    }
}
