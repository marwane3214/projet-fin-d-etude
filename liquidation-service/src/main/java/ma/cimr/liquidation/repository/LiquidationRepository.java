package ma.cimr.liquidation.repository;

import ma.cimr.liquidation.model.DemandeLiquidation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface LiquidationRepository extends JpaRepository<DemandeLiquidation, UUID> {
    List<DemandeLiquidation> findByAffilieId(String affilieId);
}
