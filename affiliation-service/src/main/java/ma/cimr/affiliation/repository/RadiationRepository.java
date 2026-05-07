package ma.cimr.affiliation.repository;

import ma.cimr.affiliation.model.Radiation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface RadiationRepository extends JpaRepository<Radiation, UUID> {
    void deleteByAffilieId(UUID affilieId);
}
