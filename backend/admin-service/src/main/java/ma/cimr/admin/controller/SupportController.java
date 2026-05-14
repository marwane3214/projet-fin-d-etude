package ma.cimr.admin.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import ma.cimr.admin.dto.SupportTicketRequest;
import ma.cimr.admin.model.SupportTicket;
import ma.cimr.admin.service.SupportService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/support")
@RequiredArgsConstructor
@Tag(name = "Support Tickets API", description = "Gestion des tickets support utilisateurs")
public class SupportController {

    private final SupportService supportService;

    @PostMapping
    @Operation(summary = "Soumettre un ticket support")
    public ResponseEntity<SupportTicket> submit(@RequestBody SupportTicketRequest req) {
        return ResponseEntity.ok(supportService.submit(req));
    }

    @GetMapping
    @Operation(summary = "Lister tous les tickets support")
    public ResponseEntity<List<SupportTicket>> getAll() {
        return ResponseEntity.ok(supportService.getAll());
    }

    @PatchMapping("/{id}/resolve")
    @Operation(summary = "Marquer un ticket comme résolu")
    public ResponseEntity<SupportTicket> resolve(@PathVariable Long id) {
        return ResponseEntity.ok(supportService.resolve(id));
    }
}
