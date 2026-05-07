package ma.cimr.affiliation.repository;

import ma.cimr.affiliation.model.Justificatif;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface JustificatifRepository extends JpaRepository<Justificatif, UUID> {
    List<Justificatif> findByAffilieId(UUID affilieId);
}
