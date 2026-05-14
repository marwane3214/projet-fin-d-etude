package ma.cimr.auth.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class PasswordResetEmailService {

    private final JavaMailSender mailSender;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    @Value("${app.mail.enabled:false}")
    private boolean mailEnabled;

    @Value("${app.mail.from:noreply@cimr.ma}")
    private String fromEmail;

    public void sendResetEmail(String toEmail, String username, String token) {
        if (!mailEnabled) {
            log.info("Email disabled. Reset token for {}: {}", username, token);
            return;
        }
        try {
            String resetLink = frontendUrl + "/reset-password?token=" + token;

            var message = mailSender.createMimeMessage();
            var helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("[CIMR] Réinitialisation de votre mot de passe");
            helper.setText(buildHtml(username, resetLink), true);
            mailSender.send(message);
            log.info("Password reset email sent to {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send reset email to {}: {}", toEmail, e.getMessage());
            throw new RuntimeException("Erreur lors de l'envoi de l'email");
        }
    }

    private String buildHtml(String username, String resetLink) {
        return """
            <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden">
              <div style="background:#1a5c28;padding:28px;text-align:center">
                <h1 style="color:#fff;margin:0;font-size:1.3rem;letter-spacing:-0.01em">🔐 Réinitialisation du mot de passe</h1>
              </div>
              <div style="padding:28px">
                <p style="color:#374151;margin:0 0 16px">Bonjour <strong>%s</strong>,</p>
                <p style="color:#374151;margin:0 0 24px">
                  Vous avez demandé la réinitialisation de votre mot de passe CIMR.<br>
                  Cliquez sur le bouton ci-dessous pour définir un nouveau mot de passe.
                </p>
                <div style="text-align:center;margin:28px 0">
                  <a href="%s"
                     style="background:#1a5c28;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:1rem;display:inline-block">
                    Réinitialiser mon mot de passe
                  </a>
                </div>
                <p style="color:#6b7280;font-size:0.82rem;margin:0 0 8px">
                  ⏱ Ce lien expire dans <strong>1 heure</strong>.
                </p>
                <p style="color:#6b7280;font-size:0.82rem;margin:0">
                  Si vous n'avez pas fait cette demande, ignorez cet email — votre mot de passe restera inchangé.
                </p>
              </div>
              <div style="background:#f3f4f6;padding:14px;text-align:center;font-size:0.75rem;color:#9ca3af">
                CIMR — Caisse Interprofessionnelle Marocaine de Retraite
              </div>
            </div>
            """.formatted(username, resetLink);
    }
}
