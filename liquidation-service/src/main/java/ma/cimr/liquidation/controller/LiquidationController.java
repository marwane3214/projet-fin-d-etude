package ma.cimr.liquidation.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import ma.cimr.liquidation.model.DemandeLiquidation;
import ma.cimr.liquidation.service.LiquidationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/liquidations")
@RequiredArgsConstructor
@Tag(name = "Liquidation API", description = "Management of pension liquidation requests")
public class LiquidationController {
    private final LiquidationService liquidationService;

    @GetMapping
    @Operation(summary = "Get all liquidation requests (Admin only)")
    public List<DemandeLiquidation> getAll() {
        return liquidationService.getAllDemandes();
    }

    @GetMapping("/affilie/{affilieId}")
    @Operation(summary = "Get liquidation requests for a specific affilié")
    public List<DemandeLiquidation> getByAffilie(@PathVariable String affilieId) {
        return liquidationService.getDemandesByAffilie(affilieId);
    }

    @PostMapping
    @Operation(summary = "Submit a new liquidation request")
    public ResponseEntity<DemandeLiquidation> create(@RequestBody DemandeLiquidation demande) {
        return ResponseEntity.ok(liquidationService.creerDemande(demande));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update status of a liquidation request (Admin only)")
    public ResponseEntity<DemandeLiquidation> updateStatus(
            @PathVariable UUID id,
            @RequestParam DemandeLiquidation.LiquidationStatus status,
            @RequestParam(required = false) String commentaire) {
        return ResponseEntity.ok(liquidationService.updateStatus(id, status, commentaire));
    }

    @PostMapping("/{id}/documents")
    @Operation(summary = "Upload a document for a liquidation request")
    public ResponseEntity<DemandeLiquidation> uploadDocument(
            @PathVariable UUID id,
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file,
            @RequestParam("type") String type) {
        return ResponseEntity.ok(liquidationService.ajouterDocument(id, file, type));
    }

    @GetMapping("/documents/{documentId}")
    @Operation(summary = "Download a document")
    public ResponseEntity<org.springframework.core.io.Resource> downloadDocument(@PathVariable UUID documentId) {
        return liquidationService.telechargerDocument(documentId);
    }
}
