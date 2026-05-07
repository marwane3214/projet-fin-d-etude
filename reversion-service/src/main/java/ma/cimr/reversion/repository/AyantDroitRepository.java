package ma.cimr.reversion.repository;

import ma.cimr.reversion.model.AyantDroit;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface AyantDroitRepository extends JpaRepository<AyantDroit, UUID> {
    List<AyantDroit> findByAffilieDecedeId(UUID affilieDecedeId);
}
