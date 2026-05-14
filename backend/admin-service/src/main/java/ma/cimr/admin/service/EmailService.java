package ma.cimr.admin.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.cimr.admin.model.SupportTicket;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.admin-email:support@cimr.ma}")
    private String adminEmail;

    @Value("${app.mail.enabled:false}")
    private boolean mailEnabled;

    @Value("${spring.mail.username:}")
    private String fromEmail;

    public void sendSupportTicketNotification(SupportTicket ticket) {
        if (!mailEnabled) {
            log.info("Email disabled. Ticket #{} saved but no email sent.", ticket.getId());
            return;
        }
        try {
            var message = mailSender.createMimeMessage();
            var helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(adminEmail);
            helper.setSubject("[CIMR Support] Nouveau ticket #" + ticket.getId() + " — " + getSubjetLabel(ticket.getSujet()));
            helper.setText(buildHtmlBody(ticket), true);
            mailSender.send(message);
            log.info("Support email sent to {} for ticket #{}", adminEmail, ticket.getId());
        } catch (Exception e) {
            log.error("Failed to send support email for ticket #{}: {}", ticket.getId(), e.getMessage());
        }
    }

    public void sendConfirmationToUser(SupportTicket ticket) {
        if (!mailEnabled) return;
        try {
            var message = mailSender.createMimeMessage();
            var helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(ticket.getEmail());
            helper.setSubject("[CIMR] Votre demande de support a été reçue — Ticket #" + ticket.getId());
            helper.setText(buildConfirmationHtml(ticket), true);
            mailSender.send(message);
            log.info("Confirmation email sent to {} for ticket #{}", ticket.getEmail(), ticket.getId());
        } catch (Exception e) {
            log.error("Failed to send confirmation email for ticket #{}: {}", ticket.getId(), e.getMessage());
        }
    }

    private String getSubjetLabel(String sujet) {
        return switch (sujet) {
            case "connexion" -> "Problème de connexion";
            default -> "Autre demande";
        };
    }

    private String buildHtmlBody(SupportTicket ticket) {
        return """
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden">
              <div style="background:#1a5c28;padding:24px;text-align:center">
                <h1 style="color:#fff;margin:0;font-size:1.4rem">🎫 Nouveau Ticket Support</h1>
              </div>
              <div style="padding:24px">
                <table style="width:100%%;border-collapse:collapse">
                  <tr><td style="padding:8px 0;color:#6b7280;width:130px">Ticket #</td><td style="padding:8px 0;font-weight:bold">%d</td></tr>
                  <tr><td style="padding:8px 0;color:#6b7280">Nom</td><td style="padding:8px 0">%s</td></tr>
                  <tr><td style="padding:8px 0;color:#6b7280">Email</td><td style="padding:8px 0"><a href="mailto:%s">%s</a></td></tr>
                  <tr><td style="padding:8px 0;color:#6b7280">Sujet</td><td style="padding:8px 0">%s</td></tr>
                  <tr><td style="padding:8px 0;color:#6b7280">Date</td><td style="padding:8px 0">%s</td></tr>
                </table>
                <div style="margin-top:16px;background:#f9fafb;border-left:4px solid #1a5c28;padding:16px;border-radius:4px">
                  <p style="margin:0;color:#374151;white-space:pre-wrap">%s</p>
                </div>
              </div>
              <div style="background:#f3f4f6;padding:16px;text-align:center;font-size:0.75rem;color:#9ca3af">
                CIMR — Portail de gestion des retraites
              </div>
            </div>
            """.formatted(
                ticket.getId(), ticket.getNom(),
                ticket.getEmail(), ticket.getEmail(),
                getSubjetLabel(ticket.getSujet()),
                ticket.getCreatedAt().toString().replace("T", " ").substring(0, 16),
                ticket.getMessage()
        );
    }

    private String buildConfirmationHtml(SupportTicket ticket) {
        return """
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden">
              <div style="background:#1a5c28;padding:24px;text-align:center">
                <h1 style="color:#fff;margin:0;font-size:1.4rem">✅ Demande reçue</h1>
              </div>
              <div style="padding:24px">
                <p>Bonjour <strong>%s</strong>,</p>
                <p>Nous avons bien reçu votre demande de support (ticket <strong>#%d</strong>).</p>
                <p>Notre équipe vous répondra dans les <strong>24 heures ouvrables</strong>.</p>
                <div style="margin-top:16px;background:#f9fafb;border-left:4px solid #1a5c28;padding:16px;border-radius:4px">
                  <p style="margin:0;color:#6b7280;font-size:0.85rem">Votre message : <em>%s</em></p>
                </div>
              </div>
              <div style="background:#f3f4f6;padding:16px;text-align:center;font-size:0.75rem;color:#9ca3af">
                CIMR — Portail de gestion des retraites
              </div>
            </div>
            """.formatted(ticket.getNom(), ticket.getId(), ticket.getMessage());
    }
}
