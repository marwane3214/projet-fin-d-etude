package ma.cimr.contribution.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import ma.cimr.contribution.model.Contribution;
import ma.cimr.contribution.model.PointsLedger;
import ma.cimr.contribution.model.PointsPurchase;
import ma.cimr.contribution.model.PointValue;
import ma.cimr.contribution.service.ContributionService;
import ma.cimr.contribution.service.PointValueService;
import ma.cimr.contribution.dto.simulation.SimulationRequest;
import ma.cimr.contribution.dto.simulation.SimulationResponse;
import ma.cimr.contribution.service.SimulationEngine;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/contributions")
@RequiredArgsConstructor
@Tag(name = "Contributions & Points API (CIMR spec)", description = "Management of contributions, retirement points and individual ledger")
public class ContributionController {
    private final ContributionService contributionService;
    private final PointValueService pointValueService;
    private final SimulationEngine simulationEngine;

    @PostMapping
    @Operation(summary = "Enregistrer une contribution (Article 6)")
    public ResponseEntity<Contribution> recordContribution(@RequestBody Contribution contribution) {
        return ResponseEntity.ok(contributionService.recordContribution(contribution));
    }

    @PostMapping("/points")
    @Operation(summary = "Alimenter ledger de points (Manuel)")
    public ResponseEntity<PointsLedger> recordPoints(@RequestBody PointsLedger ledger) {
        return ResponseEntity.ok(contributionService.recordPointsLedger(ledger));
    }

    @PostMapping("/simulate")
    @Operation(summary = "Generates a detailed points projection based on actuarial parameters")
    public ResponseEntity<SimulationResponse> calculateSimulation(@RequestBody SimulationRequest request) {
        return ResponseEntity.ok(simulationEngine.runSimulation(request));
    }

    @GetMapping
    @Operation(summary = "Get all contributions records")
    public List<Contribution> getAll() {
        return contributionService.getAll();
    }

    @PostMapping("/points/purchase")
    @Operation(summary = "Submit purchase request with proof (FormData)")
    public ResponseEntity<PointsPurchase> submitPurchase(
            @RequestParam("affilieId") UUID affilieId,
            @RequestParam(value = "affilieNom", required = false) String affilieNom,
            @RequestParam("nombrePoints") Double points,
            @RequestParam("montantTotal") BigDecimal montant,
            @RequestParam("referenceVirement") String ref,
            @RequestParam("banque") String banque,
            @RequestParam("dateVirement") String dateVirement,
            @RequestParam("file") MultipartFile file) throws IOException {
        
        return ResponseEntity.ok(contributionService.submitPurchaseRequest(
                affilieId, affilieNom, points, montant, ref, banque, dateVirement, file));
    }

    @GetMapping("/points/purchase")
    public List<PointsPurchase> getAllPurchases() {
        return contributionService.getAllPurchases();
    }

    @GetMapping("/points/purchase/affilie/{id}")
    public List<PointsPurchase> getMyPurchases(@PathVariable UUID id) {
        return contributionService.getPurchasesByAffilie(id);
    }

    @PutMapping("/points/purchase/{id}/validate")
    public ResponseEntity<PointsPurchase> validate(@PathVariable UUID id) {
        return ResponseEntity.ok(contributionService.validatePurchase(id));
    }

    @PutMapping("/points/purchase/{id}/reject")
    public ResponseEntity<PointsPurchase> reject(@PathVariable UUID id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(contributionService.rejectPurchase(id, body.get("motif")));
    }

    @GetMapping("/affilies/{id}/livret")
    public ResponseEntity<Map<String, Object>> getLivret(@PathVariable UUID id) {
        return ResponseEntity.ok(contributionService.getLivretIndividuel(id));
    }

    @GetMapping("/history/{id}")
    public List<Contribution> getHistory(@PathVariable UUID id) {
        return contributionService.getContributionsByAffilie(id);
    }

    @GetMapping("/points/{id}")
    public Map<String, Object> getPoints(@PathVariable UUID id) {
        return contributionService.getLivretIndividuel(id);
    }

    // Point Value endpoints
    @PostMapping("/point-values")
    public ResponseEntity<PointValue> setPointValue(@RequestBody PointValue pointValue) {
        return ResponseEntity.ok(pointValueService.savePointValue(pointValue));
    }

    @GetMapping("/point-values/{year}")
    public ResponseEntity<PointValue> getPointValue(@PathVariable Integer year) {
        return pointValueService.getPointValueByYear(year)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/point-values")
    public List<PointValue> getAllPointValues() {
        return pointValueService.getAllPointValues();
    }

    @GetMapping("/files/{filename:.+}")
    @Operation(summary = "Visualiser un fichier de preuve")
    public ResponseEntity<Resource> getFile(@PathVariable String filename) {
        try {
            Path file = Paths.get("uploads/proofs/").resolve(filename);
            Resource resource = new UrlResource(file.toUri());

            if (resource.exists() || resource.isReadable()) {
                String contentType = "application/octet-stream";
                if (filename.toLowerCase().endsWith(".pdf")) contentType = "application/pdf";
                else if (filename.toLowerCase().endsWith(".png")) contentType = "image/png";
                else if (filename.toLowerCase().endsWith(".jpg") || filename.toLowerCase().endsWith(".jpeg")) contentType = "image/jpeg";

                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (MalformedURLException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
