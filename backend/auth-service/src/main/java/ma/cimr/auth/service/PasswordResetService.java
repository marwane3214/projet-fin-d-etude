package ma.cimr.auth.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.cimr.auth.model.PasswordResetToken;
import ma.cimr.auth.model.User;
import ma.cimr.auth.repository.PasswordResetTokenRepository;
import ma.cimr.auth.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PasswordResetService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordResetEmailService emailService;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public void requestReset(String usernameOrEmail) {
        // Cherche par username (normalisé en majuscule) ou par email
        Optional<User> userOpt = userRepository.findByUsername(usernameOrEmail.toUpperCase());
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByEmailIgnoreCase(usernameOrEmail);
        }

        // On ne révèle pas si l'utilisateur existe ou non (sécurité)
        if (userOpt.isEmpty()) {
            log.warn("Reset requested for unknown user: {}", usernameOrEmail);
            return;
        }

        User user = userOpt.get();

        // Génère un token unique
        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = PasswordResetToken.builder()
                .token(token)
                .userId(user.getId())
                .expiresAt(LocalDateTime.now().plusHours(1))
                .used(false)
                .createdAt(LocalDateTime.now())
                .build();

        tokenRepository.save(resetToken);
        emailService.sendResetEmail(user.getEmail(), user.getUsername(), token);
        log.info("Password reset token created for user: {}", user.getUsername());
    }

    public boolean validateToken(String token) {
        return tokenRepository.findByToken(token)
                .map(t -> !t.isUsed() && t.getExpiresAt().isAfter(LocalDateTime.now()))
                .orElse(false);
    }

    @Transactional
    public boolean resetPassword(String token, String newPassword) {
        Optional<PasswordResetToken> tokenOpt = tokenRepository.findByToken(token);

        if (tokenOpt.isEmpty()) return false;

        PasswordResetToken resetToken = tokenOpt.get();

        if (resetToken.isUsed() || resetToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            return false;
        }

        Optional<User> userOpt = userRepository.findById(resetToken.getUserId());
        if (userOpt.isEmpty()) return false;

        User user = userOpt.get();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        resetToken.setUsed(true);
        tokenRepository.save(resetToken);

        log.info("Password successfully reset for user: {}", user.getUsername());
        return true;
    }
}
