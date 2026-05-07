package ma.cimr.contribution.repository;

import ma.cimr.contribution.model.PointsLedger;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface PointsLedgerRepository extends JpaRepository<PointsLedger, UUID> {
    List<PointsLedger> findByAffilieId(UUID affilieId);
}
