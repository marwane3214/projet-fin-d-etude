package ma.cimr.payment.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import ma.cimr.payment.model.Allocation;
import ma.cimr.payment.model.Paiement;
import ma.cimr.payment.service.PaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Tag(name = "Payments & Allocations API", description = "Endpoints for pension payment life cycle")
public class PaymentController {
    private final PaymentService paymentService;

    // ===== ALLOCATIONS =====

    @GetMapping("/allocations")
    @Operation(summary = "List all allocations")
    public List<Allocation> getAllAllocations() {
        return paymentService.getAllAllocations();
    }

    @GetMapping("/allocations/{id}")
    @Operation(summary = "Get allocation by ID")
    public ResponseEntity<Allocation> getAllocationById(@PathVariable UUID id) {
        return ResponseEntity.ok(paymentService.getAllocationById(id));
    }

    @PostMapping("/allocations")
    @Operation(summary = "Establish a new pension allocation (CIMR Article 31)")
    public ResponseEntity<Allocation> createAllocation(@RequestBody Allocation allocation) {
        return ResponseEntity.ok(paymentService.createAllocation(allocation));
    }

    @PutMapping("/allocations/{id}/status")
    @Operation(summary = "Update allocation status")
    public ResponseEntity<Allocation> updateAllocationStatus(@PathVariable UUID id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(paymentService.updateAllocationStatus(id, body.get("statut")));
    }

    // ===== PAIEMENTS =====

    @GetMapping("/paiements")
    @Operation(summary = "List all paiements")
    public List<Paiement> getAllPaiements() {
        return paymentService.getAllPaiements();
    }

    @GetMapping("/allocations/{allocationId}/paiements")
    @Operation(summary = "Get paiements for a specific allocation")
    public List<Paiement> getPaiementsByAllocation(@PathVariable UUID allocationId) {
        return paymentService.getPaiementsByAllocation(allocationId);
    }

    @PostMapping("/paiements")
    @Operation(summary = "Create a new paiement")
    public ResponseEntity<Paiement> createPaiement(@RequestBody Paiement paiement) {
        return ResponseEntity.ok(paymentService.createPaiement(paiement));
    }

    @PutMapping("/paiements/{id}/status")
    @Operation(summary = "Update paiement status")
    public ResponseEntity<Paiement> updatePaiementStatus(@PathVariable UUID id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(paymentService.updatePaiementStatus(id, body.get("statut")));
    }

    // ===== LEGACY ENDPOINTS =====

    @PostMapping("/schedule")
    @Operation(summary = "Schedule a specific payment for an allocation")
    public ResponseEntity<Paiement> schedule(@RequestParam UUID allocationId, @RequestParam String date) {
        return ResponseEntity.ok(paymentService.schedulePayment(allocationId, LocalDate.parse(date)));
    }

    @PostMapping("/{id}/process")
    @Operation(summary = "Trigger actual payment processing (Bank Interface)")
    public ResponseEntity<Paiement> process(@PathVariable UUID id) {
        return ResponseEntity.ok(paymentService.processPayment(id));
    }

    @GetMapping("/affilie/{affilieId}")
    @Operation(summary = "View payment history for an affilié")
    public List<Paiement> getHistory(@PathVariable UUID affilieId) {
        return paymentService.getHistoryByAffilie(affilieId);
    }
}
