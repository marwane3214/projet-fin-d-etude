package ma.cimr.affiliation.repository;

import ma.cimr.affiliation.model.Affilie;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface AffilieRepository extends JpaRepository<Affilie, UUID> {
    Optional<Affilie> findByCin(String cin);
    Optional<Affilie> findByNumImmatriculation(String numImmatriculation);
    Optional<Affilie> findByEmail(String email);
}
