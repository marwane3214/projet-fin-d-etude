package ma.cimr.affiliation.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import ma.cimr.affiliation.model.Affilie;
import ma.cimr.affiliation.service.AffiliationService;
import ma.cimr.affiliation.dto.CreateAffilieRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ma.cimr.affiliation.model.BulletinAffiliation;
import ma.cimr.affiliation.model.Justificatif;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.MediaType;
import ma.cimr.affiliation.service.FileUploadService;
import java.io.IOException;
import java.time.LocalDateTime;
import java.math.BigDecimal;

@RestController
@RequestMapping("/api/affilies")
@RequiredArgsConstructor
@Tag(name = "Affiliation API", description = "Endpoints for managing CIMR Affiliés")
public class AffilieController {
    private final AffiliationService affiliationService;
    private final FileUploadService fileUploadService;

    @GetMapping
    @Operation(summary = "Get all affiliés")
    public List<Affilie> getAll() {
        return affiliationService.getAllAffilies();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get affilié by ID")
    public Affilie getById(@PathVariable UUID id) {
        return affiliationService.getAffilieById(id);
    }

    @PostMapping
    @Operation(summary = "Register a new affilié with account")
    public ResponseEntity<Affilie> create(@RequestBody CreateAffilieRequest request) {
        return ResponseEntity.ok(affiliationService.registerAffilie(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update full affilié info")
    public Affilie updateAffilie(@PathVariable UUID id, @RequestBody Affilie request) {
        return affiliationService.updateAffilie(id, request);
    }

    @PatchMapping("/{id}/personal-info")
    @Operation(summary = "Update personal information periodically")
    public Affilie updatePersonalInfo(@PathVariable UUID id, @RequestBody Map<String, String> request) {
        return affiliationService.updatePersonalInfo(id, request.get("adresse"), request.get("situationFamiliale"), request.get("ville"));
    }

    @PatchMapping("/{id}/cndp-consent")
    @Operation(summary = "Update CNDP consent")
    public Affilie updateCndpConsent(@PathVariable UUID id, @RequestBody Map<String, Boolean> request) {
        return affiliationService.updateCndpConsent(id, request.get("consent"));
    }

    @PostMapping("/{id}/bulletins")
    @Operation(summary = "Add a new bulletin d'affiliation")
    public BulletinAffiliation addBulletin(@PathVariable UUID id, @RequestBody BulletinAffiliation bulletin) {
        return affiliationService.createBulletin(id, bulletin);
    }

    @GetMapping("/{id}/bulletins")
    @Operation(summary = "Get bulletins d'affiliation by affilié")
    public List<BulletinAffiliation> getBulletins(@PathVariable UUID id) {
        return affiliationService.getBulletins(id);
    }

    @PostMapping("/{id}/documents")
    @Operation(summary = "Upload a justificatif document metadata")
    public Justificatif addJustificatif(@PathVariable UUID id, @RequestBody Justificatif justificatif) {
        return affiliationService.addJustificatif(id, justificatif);
    }

    @PostMapping(value = "/{id}/documents/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload a justificatif document file")
    public ResponseEntity<Justificatif> uploadJustificatif(
            @PathVariable UUID id,
            @RequestParam("file") MultipartFile file,
            @RequestParam("nom") String nom,
            @RequestParam("typeDocument") String typeDocument) {
        try {
            String fileName = fileUploadService.storeFile(file);
            String url = "/api/documents/" + fileName;

            Justificatif doc = Justificatif.builder()
                    .nom(nom)
                    .typeDocument(typeDocument)
                    .urlStockage(url)
                    .dateUpload(LocalDateTime.now())
                    .build();

            return ResponseEntity.ok(affiliationService.addJustificatif(id, doc));
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/{id}/documents")
    @Operation(summary = "Get justificatifs by affilié")
    public List<Justificatif> getJustificatifs(@PathVariable UUID id) {
        return affiliationService.getJustificatifs(id);
    }

    @PostMapping("/{id}/suspend")
    @Operation(summary = "Suspend an affilié (Max 3 years)")
    public Affilie suspend(@PathVariable UUID id, @RequestHeader(value = "X-User-Id", defaultValue = "SYSTEM") String userId) {
        return affiliationService.suspendAffilie(id, userId);
    }

    @PostMapping("/{id}/radiate")
    @Operation(summary = "Radiate an affilié with motif and optional contribution compensatrice")
    public Affilie radiate(@PathVariable UUID id, @RequestBody Map<String, Object> request, @RequestHeader(value = "X-User-Id", defaultValue = "SYSTEM") String userId) {
        String motif = (String) request.get("motif");
        BigDecimal comp = request.containsKey("contributionCompensatrice") ? new BigDecimal(request.get("contributionCompensatrice").toString()) : BigDecimal.ZERO;
        return affiliationService.radiateAffilie(id, motif, comp, userId);
    }

    @GetMapping("/{id}/points")
    @Operation(summary = "Get acquired points from Contribution Service")
    public Map<String, Object> getPoints(@PathVariable UUID id) {
        return affiliationService.getPoints(id);
    }

    @GetMapping("/{id}/contributions")
    @Operation(summary = "Get monthly contributions from Contribution Service")
    public List<Map<String, Object>> getContributions(@PathVariable UUID id) {
        return affiliationService.getContributions(id);
    }

    @GetMapping("/{id}/export")
    @Operation(summary = "Export all data related to an affilié (RGPD)")
    public Map<String, Object> exportData(@PathVariable UUID id) {
        return affiliationService.exportData(id);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Anonymize an affilié (Right to be forgotten)")
    public ResponseEntity<Void> anonymize(@PathVariable UUID id) {
        affiliationService.anonymizeAffilie(id);
        return ResponseEntity.noContent().build();
    }
}
