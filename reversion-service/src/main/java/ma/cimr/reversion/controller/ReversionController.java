package ma.cimr.reversion.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import ma.cimr.reversion.model.AyantDroit;
import ma.cimr.reversion.service.ReversionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/reversions")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(name = "Réversion & Ayants-Droit API", description = "Management of survivor rights for spouses and orphans")
public class ReversionController {
    private final ReversionService reversionService;

    @GetMapping
    @Operation(summary = "Get all ayants-droit")
    public List<AyantDroit> getAll() {
        return reversionService.getAllAyantsDroit();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get ayant-droit by ID")
    public ResponseEntity<AyantDroit> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(reversionService.getById(id));
    }

    @GetMapping("/affilie/{affilieId}")
    @Operation(summary = "Get list of survivors for a deceased affilié")
    public List<AyantDroit> getByAffilie(@PathVariable UUID affilieId) {
        return reversionService.getAyantsDroitByAffilie(affilieId);
    }

    @PostMapping
    @Operation(summary = "Register a new ayant-droit (CIMR Article 39)")
    public ResponseEntity<AyantDroit> create(@RequestBody AyantDroit ayantDroit) {
        return ResponseEntity.ok(reversionService.createAyantDroit(ayantDroit));
    }

    @PutMapping("/{id}/status")
    @Operation(summary = "Update ayant-droit status")
    public ResponseEntity<AyantDroit> updateStatus(@PathVariable UUID id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(reversionService.updateStatus(id, body.get("statut"), body.get("motif")));
    }
}
