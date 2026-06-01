package ma.cimr.liquidation.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.cimr.liquidation.model.DemandeLiquidation;
import ma.cimr.liquidation.model.DossierDocument;
import ma.cimr.liquidation.dto.NotificationEvent;
import ma.cimr.liquidation.repository.LiquidationRepository;
import ma.cimr.liquidation.repository.DossierDocumentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class LiquidationService {
    private final LiquidationRepository liquidationRepository;
    private final DossierDocumentRepository documentRepository;
    private final NotificationProducer notificationProducer;

    private static final String UPLOAD_DIR = "uploads/liquidations/";

    public List<DemandeLiquidation> getAllDemandes() {
        return liquidationRepository.findAll();
    }

    public List<DemandeLiquidation> getDemandesByAffilie(String affilieId) {
        return liquidationRepository.findByAffilieId(affilieId);
    }

    @Transactional
    public DemandeLiquidation creerDemande(DemandeLiquidation demande) {
        // Find and delete any existing demands for this affilieId
        List<DemandeLiquidation> existingDemandes = liquidationRepository.findByAffilieId(demande.getAffilieId());
        if (!existingDemandes.isEmpty()) {
            liquidationRepository.deleteAll(existingDemandes);
        }

        demande.setDateDemande(LocalDateTime.now());
        demande.setStatus(DemandeLiquidation.LiquidationStatus.SUBMITTED);
        DemandeLiquidation saved = liquidationRepository.save(demande);

        try {
            notificationProducer.sendNotification(NotificationEvent.builder()
                    .userId("admin")
                    .title("Nouvelle demande de liquidation")
                    .message("Une nouvelle demande a été soumise par l'affilié ID: " + demande.getAffilieId())
                    .type("LIQUIDATION_SUBMITTED")
                    .referenceId(saved.getId().toString())
                    .build());
        } catch (Exception e) {
            log.warn("Failed to send liquidation notification to Kafka: {}", e.getMessage());
        }

        return saved;
    }

    @Transactional
    public DemandeLiquidation updateStatus(UUID id, DemandeLiquidation.LiquidationStatus status, String commentaire) {
        DemandeLiquidation demande = liquidationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Demande not found"));
        demande.setStatus(status);
        demande.setCommentaireAdmin(commentaire);
        DemandeLiquidation saved = liquidationRepository.save(demande);

        try {
            notificationProducer.sendNotification(NotificationEvent.builder()
                    .userId(demande.getAffilieId())
                    .title("Mise à jour de votre liquidation")
                    .message("Le statut de votre demande est passé à: " + status + ". Commentaire: " + commentaire)
                    .type("LIQUIDATION_STATUS_UPDATE")
                    .referenceId(saved.getId().toString())
                    .build());
        } catch (Exception e) {
            log.warn("Failed to send status update notification to Kafka: {}", e.getMessage());
        }

        return saved;
    }

    @Transactional
    public DemandeLiquidation ajouterDocument(UUID id, MultipartFile file, String type) {
        DemandeLiquidation demande = liquidationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Demande not found"));

        try {
            Path root = Paths.get(UPLOAD_DIR);
            if (!Files.exists(root)) {
                Files.createDirectories(root);
            }
            
            String filename = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Files.copy(file.getInputStream(), root.resolve(filename));

            DossierDocument doc = DossierDocument.builder()
                    .demande(demande)
                    .typeDocument(type)
                    .fileUri(UPLOAD_DIR + filename)
                    .nomFichier(file.getOriginalFilename())
                    .tailleFichier(file.getSize())
                    .uploadDate(LocalDateTime.now())
                    .statut(DossierDocument.DocumentStatut.EN_ATTENTE)
                    .isVerified(false)
                    .build();

            documentRepository.save(doc);
            return liquidationRepository.findById(id).get();
        } catch (IOException e) {
            throw new RuntimeException("Could not store the file. Error: " + e.getMessage());
        }
    }

    public ResponseEntity<Resource> telechargerDocument(UUID documentId) {
        DossierDocument doc = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));
        
        try {
            Path file = Paths.get(doc.getFileUri());
            Resource resource = new UrlResource(file.toUri());
            
            if (resource.exists() || resource.isReadable()) {
                String contentType = "application/octet-stream";
                try {
                    String probed = Files.probeContentType(file);
                    if (probed != null) contentType = probed;
                } catch (IOException e) {
                    // fall back to octet-stream
                }
                
                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + file.getFileName().toString() + "\"")
                        .body(resource);
            } else {
                throw new RuntimeException("Could not read the file!");
            }
        } catch (MalformedURLException e) {
            throw new RuntimeException("Error: " + e.getMessage());
        }
    }
}
