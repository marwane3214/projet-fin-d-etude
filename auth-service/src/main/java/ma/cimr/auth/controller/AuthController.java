package ma.cimr.auth.controller;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import ma.cimr.auth.model.User;
import ma.cimr.auth.repository.UserRepository;
import ma.cimr.auth.service.JwtService;
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
