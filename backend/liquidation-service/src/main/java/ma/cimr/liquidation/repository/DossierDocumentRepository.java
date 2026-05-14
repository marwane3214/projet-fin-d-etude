package ma.cimr.liquidation.repository;

import ma.cimr.liquidation.model.DossierDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface DossierDocumentRepository extends JpaRepository<DossierDocument, UUID> {
}
