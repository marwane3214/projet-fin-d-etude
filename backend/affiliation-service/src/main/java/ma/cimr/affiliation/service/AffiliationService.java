package ma.cimr.affiliation.service;

import lombok.RequiredArgsConstructor;
import ma.cimr.affiliation.model.Affilie;
import ma.cimr.affiliation.model.BulletinAffiliation;
import ma.cimr.affiliation.model.Justificatif;
import ma.cimr.affiliation.model.Radiation;
import ma.cimr.affiliation.model.AuditLog;
import ma.cimr.affiliation.repository.AffilieRepository;
import ma.cimr.affiliation.repository.BulletinAffiliationRepository;
import ma.cimr.affiliation.repository.JustificatifRepository;
import ma.cimr.affiliation.repository.RadiationRepository;
import ma.cimr.affiliation.repository.AuditLogRepository;
import ma.cimr.affiliation.client.ContributionClient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ma.cimr.affiliation.dto.CreateAffilieRequest;
import ma.cimr.affiliation.event.AffilieEvent;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.beans.BeanUtils;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AffiliationService {
    private final AffilieRepository affilieRepository;
    private final BulletinAffiliationRepository bulletinRepository;
    private final JustificatifRepository justificatifRepository;
    private final RadiationRepository radiationRepository;
    private final AuditLogRepository auditLogRepository;
    private final KafkaTemplate<String, AffilieEvent> kafkaTemplate;
    private final ContributionClient contributionClient;

    private static final String AFFILIE_TOPIC = "affilie-events";

    public List<Affilie> getAllAffilies() {
        return affilieRepository.findAll();
    }

    public Affilie getAffilieById(UUID id) {
        return affilieRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Affilié not found"));
    }

    @Transactional
    public Affilie registerAffilie(CreateAffilieRequest request) {
        // Normalize critical fields to uppercase for case-insensitive uniqueness with encryption
        if (request.getCin() != null) request.setCin(request.getCin().toUpperCase());
        if (request.getEmail() != null) request.setEmail(request.getEmail().toUpperCase());
        if (request.getUsername() != null) request.setUsername(request.getUsername().toUpperCase());

        // Hibernate 6 is strict: we MUST save an actual @Entity instance, not a subclass DTO.
        Affilie affilie = new Affilie();
        BeanUtils.copyProperties(request, affilie);
        
        // Ensure some fields that might be renamed or handled differently are still covered
        if (affilie.getStatus() == null) affilie.setStatus(Affilie.AffilieStatus.ACTIVE);
        
        // Save the base Affilie info
        affilie = createAffilie(affilie);
        
        // Emit event for Auth Service to create user
        AffilieEvent event = AffilieEvent.builder()
                .type("CREATE_ACCOUNT")
                .affilieId(affilie.getId())
                .username(request.getUsername())
                .password(request.getPassword())
                .email(affilie.getEmail())
                .cin(affilie.getCin())
                .build();
        
        try {
            kafkaTemplate.send(AFFILIE_TOPIC, event);
        } catch (Exception e) {
            System.err.println("Failed to send Kafka event: " + e.getMessage());
        }
        return affilie;
    }

    @Transactional
    public Affilie createAffilie(Affilie affilie) {
        if (affilie.getCin() != null) affilie.setCin(affilie.getCin().toUpperCase());
        if (affilie.getEmail() != null) affilie.setEmail(affilie.getEmail().toUpperCase());

        if (affilieRepository.findByCin(affilie.getCin()).isPresent()) {
            throw new RuntimeException("Un affilié avec ce CIN existe déjà.");
        }
        if (affilie.getEmail() != null && !affilie.getEmail().isEmpty() && affilieRepository.findByEmail(affilie.getEmail()).isPresent()) {
            throw new RuntimeException("Cet email est déjà utilisé par un autre affilié.");
        }
        
        // Auto-generate CIMR Matricule if missing
        if (affilie.getNumImmatriculation() == null || affilie.getNumImmatriculation().isEmpty()) {
            String year = String.valueOf(java.time.Year.now().getValue());
            // Using time-based random to avoid duplicate key exceptions heavily when db size fluctuates
            long uniqueSuffix = (System.currentTimeMillis() % 9000) + 1000;
            affilie.setNumImmatriculation(String.format("CIMR-%s-%04d", year, uniqueSuffix));
        }

        if (affilie.getStatus() == null) {
            affilie.setStatus(Affilie.AffilieStatus.ACTIVE);
        }

        if (affilie.getDateInscription() == null) {
            affilie.setDateInscription(java.time.LocalDate.now());
        }

        return affilieRepository.save(affilie);
    }

    @Transactional
    public Affilie updateAffilie(UUID id, Affilie updateReq) {
        Affilie existing = getAffilieById(id);
        if (updateReq.getNom() != null) existing.setNom(updateReq.getNom());
        if (updateReq.getPrenom() != null) existing.setPrenom(updateReq.getPrenom());
        if (updateReq.getCin() != null) existing.setCin(updateReq.getCin().toUpperCase());
        if (updateReq.getNumImmatriculation() != null) existing.setNumImmatriculation(updateReq.getNumImmatriculation());
        if (updateReq.getEmployeur() != null) existing.setEmployeur(updateReq.getEmployeur());
        if (updateReq.getAdresse() != null) existing.setAdresse(updateReq.getAdresse());
        if (updateReq.getVille() != null) existing.setVille(updateReq.getVille());
        if (updateReq.getEmail() != null) existing.setEmail(updateReq.getEmail().toUpperCase());
        if (updateReq.getTelephone() != null) existing.setTelephone(updateReq.getTelephone());
        if (updateReq.getSituationFamiliale() != null) existing.setSituationFamiliale(updateReq.getSituationFamiliale());
        if (updateReq.getSalaireMensuel() != null) existing.setSalaireMensuel(updateReq.getSalaireMensuel());
        if (updateReq.getDateNaissance() != null) existing.setDateNaissance(updateReq.getDateNaissance());
        if (updateReq.getLieuNaissance() != null) existing.setLieuNaissance(updateReq.getLieuNaissance());
        if (updateReq.getSexe() != null) existing.setSexe(updateReq.getSexe());
        if (updateReq.getDateAffiliation() != null) existing.setDateAffiliation(updateReq.getDateAffiliation());

        return affilieRepository.save(existing);
    }

    @Transactional
    public Affilie updatePersonalInfo(UUID id, String adresse, String situationFamiliale, String ville) {
        Affilie existing = getAffilieById(id);
        if (adresse != null) existing.setAdresse(adresse);
        if (situationFamiliale != null) existing.setSituationFamiliale(situationFamiliale);
        if (ville != null) existing.setVille(ville);
        return affilieRepository.save(existing);
    }

    @Transactional
    public Affilie updateCndpConsent(UUID id, Boolean consent) {
        Affilie existing = getAffilieById(id);
        existing.setConsentCndp(consent);
        existing.setDateConsent(LocalDateTime.now());
        return affilieRepository.save(existing);
    }

    @Transactional
    public BulletinAffiliation createBulletin(UUID id, BulletinAffiliation bulletin) {
        Affilie affilie = getAffilieById(id);
        bulletin.setAffilie(affilie);
        if (bulletin.getDateCreation() == null) bulletin.setDateCreation(LocalDateTime.now());
        if (bulletin.getStatus() == null) bulletin.setStatus(BulletinAffiliation.BulletinStatus.DRAFT);
        return bulletinRepository.save(bulletin);
    }

    public List<BulletinAffiliation> getBulletins(UUID id) {
        return bulletinRepository.findByAffilieId(id);
    }

    @Transactional
    public Justificatif addJustificatif(UUID id, Justificatif justif) {
        Affilie affilie = getAffilieById(id);
        justif.setAffilie(affilie);
        if (justif.getDateUpload() == null) justif.setDateUpload(LocalDateTime.now());
        return justificatifRepository.save(justif);
    }

    public List<Justificatif> getJustificatifs(UUID id) {
        return justificatifRepository.findByAffilieId(id);
    }

    private void logAudit(String action, String entiteId, String entiteType, String details, String performedBy) {
        AuditLog log = AuditLog.builder()
                .action(action)
                .entiteId(entiteId)
                .entiteType(entiteType)
                .details(details)
                .performedBy(performedBy)
                .timestamp(LocalDateTime.now())
                .build();
        auditLogRepository.save(log);
    }

    @Transactional
    public Affilie suspendAffilie(UUID id, String currentUser) {
        Affilie affilie = getAffilieById(id);
        affilie.setStatus(Affilie.AffilieStatus.SUSPENDED);
        affilie.setDateSuspension(LocalDateTime.now());
        Affilie saved = affilieRepository.save(affilie);
        logAudit("SUSPEND", id.toString(), "Affilie", "Suspension de l'affilié pour max 3 ans", currentUser);
        return saved;
    }

    @Transactional
    public Affilie radiateAffilie(UUID id, String motif, java.math.BigDecimal contributionComp, String currentUser) {
        Affilie affilie = getAffilieById(id);
        affilie.setStatus(Affilie.AffilieStatus.RADIE);
        
        Radiation rad = Radiation.builder()
                .affilie(affilie)
                .motif(motif)
                .dateRadiation(LocalDateTime.now())
                .contributionCompensatrice(contributionComp)
                .build();
        radiationRepository.save(rad);
        
        Affilie saved = affilieRepository.save(affilie);
        logAudit("RADIATE", id.toString(), "Affilie", "Radiation avec motif: " + motif, currentUser);
        return saved;
    }

    public List<Map<String, Object>> getContributions(UUID id) {
        return contributionClient.getContributionsByAffilie(id);
    }

    public java.util.Map<String, Object> getPoints(UUID id) {
        return contributionClient.getPointsByAffilie(id);
    }

    public java.util.Map<String, Object> exportData(UUID id) {
        Affilie affilie = getAffilieById(id);
        java.util.Map<String, Object> export = new java.util.HashMap<>();
        export.put("profile", affilie);
        export.put("bulletins", getBulletins(id));
        export.put("justificatifs", getJustificatifs(id));
        // Also fetch from other microservices if needed
        logAudit("EXPORT", id.toString(), "Affilie", "Export des données RGPD/CNDP", "SYSTEM");
        return export;
    }

    @Transactional
    public void anonymizeAffilie(UUID id) {
        Affilie affilie = getAffilieById(id);
        
        // Supprimer d'abord les radiations liées pour éviter les contraintes FK
        radiationRepository.deleteByAffilieId(id);
        
        // La suppression de l'affilié supprimera en cascade les bulletins et justificatifs
        affilieRepository.delete(affilie);
        
        logAudit("DELETE", id.toString(), "Affilie", "Suppression définitive des données de l'affilié", "SYSTEM");
        
        // Notifier auth-service pour supprimer le compte utilisateur lié
        AffilieEvent event = AffilieEvent.builder()
                .type("DELETE_ACCOUNT")
                .affilieId(id)
                .build();
        try {
            kafkaTemplate.send(AFFILIE_TOPIC, event);
        } catch (Exception e) {
            System.err.println("Failed to send Kafka event for account deletion: " + e.getMessage());
        }
    }
}
