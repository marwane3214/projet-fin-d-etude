package ma.cimr.contribution.repository;

import ma.cimr.contribution.model.PointsPurchase;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface PointsPurchaseRepository extends JpaRepository<PointsPurchase, UUID> {
    List<PointsPurchase> findByAffilieId(UUID affilieId);
}
