package ma.cimr.contribution.repository;

import ma.cimr.contribution.model.Contribution;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface ContributionRepository extends JpaRepository<Contribution, UUID> {
    List<Contribution> findByAffilieId(UUID affilieId);
}
