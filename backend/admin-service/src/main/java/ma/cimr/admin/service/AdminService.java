package ma.cimr.admin.service;

import lombok.RequiredArgsConstructor;
import ma.cimr.admin.model.AuditLog;
import ma.cimr.admin.model.UserConsent;
import ma.cimr.admin.repository.AuditLogRepository;
import ma.cimr.admin.repository.ConsentRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdminService {
    private final AuditLogRepository auditLogRepository;
    private final ConsentRepository consentRepository;

    public void logAudit(AuditLog log) {
        log.setTimestamp(LocalDateTime.now());
        auditLogRepository.save(log);
    }

    public List<AuditLog> getLogs() {
        return auditLogRepository.findAll();
    }

    public UserConsent captureConsent(UUID userId, boolean consented) {
        UserConsent consent = consentRepository.findByUserId(userId)
                .orElse(UserConsent.builder().userId(userId).build());
        
        consent.setHasConsented(consented);
        consent.setConsentDate(LocalDateTime.now());
        consent.setConsentVersion("V1.0");
        
        return consentRepository.save(consent);
    }
}
