package ma.cimr.payment.repository;

import ma.cimr.payment.model.Paiement;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;
import java.util.List;

public interface PaiementRepository extends JpaRepository<Paiement, UUID> {
    List<Paiement> findByAllocationAffilieId(UUID affilieId);
    List<Paiement> findByAllocationId(UUID allocationId);
}
