package ma.cimr.admin.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import ma.cimr.admin.model.AuditLog;
import ma.cimr.admin.model.UserConsent;
import ma.cimr.admin.service.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Tag(name = "Administration & Audit API", description = "Management of audit logs and CNDP compliance")
public class AdminController {
    private final AdminService adminService;

    @GetMapping("/logs")
    @Operation(summary = "Get all system audit logs")
    public List<AuditLog> getLogs() {
        return adminService.getLogs();
    }

    @PostMapping("/audit")
    @Operation(summary = "Publish an audit log entry")
    public ResponseEntity<Void> log(@RequestBody AuditLog log) {
        adminService.logAudit(log);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/consent/{userId}")
    @Operation(summary = "Capture user consent for CNDP compliance")
    public ResponseEntity<UserConsent> captureConsent(@PathVariable UUID userId, @RequestParam boolean consented) {
        return ResponseEntity.ok(adminService.captureConsent(userId, consented));
    }
}
