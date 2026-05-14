package ma.cimr.auth.controller;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import ma.cimr.auth.model.User;
import ma.cimr.auth.repository.UserRepository;
import ma.cimr.auth.service.JwtService;
import ma.cimr.auth.service.PasswordResetService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final PasswordResetService passwordResetService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        String normalizedUsername = request.getUsername() != null ? request.getUsername().toUpperCase() : "";
        var userOpt = userRepository.findByUsername(normalizedUsername);
        
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Identifiants incorrects"));
        }
        
        User user = userOpt.get();
        
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Identifiants incorrects"));
        }
        
        String token = jwtService.generateToken(user);
        return ResponseEntity.ok(new AuthResponse(token, user.getUsername(), user.getRoles(), user.getAffilieId()));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> body) {
        String usernameOrEmail = body.get("usernameOrEmail");
        if (usernameOrEmail == null || usernameOrEmail.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Identifiant requis"));
        }
        passwordResetService.requestReset(usernameOrEmail);
        return ResponseEntity.ok(Map.of("message", "Si ce compte existe, un email de réinitialisation a été envoyé."));
    }

    @GetMapping("/validate-token")
    public ResponseEntity<?> validateToken(@RequestParam String token) {
        boolean valid = passwordResetService.validateToken(token);
        return ResponseEntity.ok(Map.of("valid", valid));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> body) {
        String token = body.get("token");
        String newPassword = body.get("newPassword");
        if (token == null || newPassword == null || newPassword.length() < 6) {
            return ResponseEntity.badRequest().body(Map.of("message", "Données invalides"));
        }
        boolean success = passwordResetService.resetPassword(token, newPassword);
        if (!success) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Lien invalide ou expiré"));
        }
        return ResponseEntity.ok(Map.of("message", "Mot de passe réinitialisé avec succès"));
    }

    @Data
    static class LoginRequest {
        private String username;
        private String password;
    }

    @Data
    @RequiredArgsConstructor
    static class AuthResponse {
        private final String token;
        private final String username;
        private final java.util.Set<User.Role> roles;
        private final UUID affilieId; // null for admin/agent users
    }
}
