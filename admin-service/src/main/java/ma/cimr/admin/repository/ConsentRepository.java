package ma.cimr.admin.repository;

import ma.cimr.admin.model.UserConsent;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface ConsentRepository extends JpaRepository<UserConsent, UUID> {
    Optional<UserConsent> findByUserId(UUID userId);
}
