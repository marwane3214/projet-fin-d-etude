package ma.cimr.affiliation.repository;

import ma.cimr.affiliation.model.BulletinAffiliation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface BulletinAffiliationRepository extends JpaRepository<BulletinAffiliation, UUID> {
    List<BulletinAffiliation> findByAffilieId(UUID affilieId);
}
