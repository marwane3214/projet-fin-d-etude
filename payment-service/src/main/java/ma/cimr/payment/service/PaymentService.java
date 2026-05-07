package ma.cimr.payment.service;

import lombok.RequiredArgsConstructor;
import ma.cimr.payment.model.Allocation;
import ma.cimr.payment.model.Paiement;
import ma.cimr.payment.repository.AllocationRepository;
import ma.cimr.payment.repository.PaiementRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentService {
    private final AllocationRepository allocationRepository;
    private final PaiementRepository paiementRepository;

    // ===== ALLOCATIONS =====

    public List<Allocation> getAllAllocations() {
        return allocationRepository.findAll();
    }

    public Allocation getAllocationById(UUID id) {
        return allocationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Allocation not found"));
    }

    @Transactional
    public Allocation createAllocation(Allocation allocation) {
        if (allocation.getStatus() == null) {
            allocation.setStatus(Allocation.AllocationStatus.ACTIVE);
        }
        return allocationRepository.save(allocation);
    }

    @Transactional
    public Allocation updateAllocationStatus(UUID id, String status) {
        Allocation allocation = getAllocationById(id);
        allocation.setStatus(Allocation.AllocationStatus.valueOf(status));
        return allocationRepository.save(allocation);
    }

    // ===== PAIEMENTS =====

    public List<Paiement> getAllPaiements() {
        return paiementRepository.findAll();
    }

    public List<Paiement> getPaiementsByAllocation(UUID allocationId) {
        return paiementRepository.findByAllocationId(allocationId);
    }

    @Transactional
    public Paiement createPaiement(Paiement paiement) {
        if (paiement.getStatus() == null) {
            paiement.setStatus(Paiement.PaiementStatus.SCHEDULED);
        }
        return paiementRepository.save(paiement);
    }

    @Transactional
    public Paiement updatePaiementStatus(UUID id, String status) {
        Paiement paiement = paiementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Paiement not found"));
        paiement.setStatus(Paiement.PaiementStatus.valueOf(status));
        return paiementRepository.save(paiement);
    }

    @Transactional
    public Paiement schedulePayment(UUID allocationId, LocalDate echeance) {
        Allocation allocation = allocationRepository.findById(allocationId)
                .orElseThrow(() -> new RuntimeException("Allocation not found"));
        
        Paiement paiement = Paiement.builder()
                .allocation(allocation)
                .montant(allocation.getMontant())
                .dateEcheance(echeance)
                .status(Paiement.PaiementStatus.SCHEDULED)
                .build();
        
        return paiementRepository.save(paiement);
    }

    @Transactional
    public Paiement processPayment(UUID paiementId) {
        Paiement paiement = paiementRepository.findById(paiementId)
                .orElseThrow(() -> new RuntimeException("Paiement not found"));
        
        // Mock Bank Call Simulation
        paiement.setStatus(Paiement.PaiementStatus.PAID);
        paiement.setDatePaiementEffectif(LocalDateTime.now());
        paiement.setTransactionReference("TRX-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        
        return paiementRepository.save(paiement);
    }

    public List<Paiement> getHistoryByAffilie(UUID affilieId) {
        return paiementRepository.findByAllocationAffilieId(affilieId);
    }
}
