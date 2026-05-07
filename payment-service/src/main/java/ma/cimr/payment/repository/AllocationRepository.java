package ma.cimr.payment.repository;

import ma.cimr.payment.model.Allocation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;
import java.util.List;

public interface AllocationRepository extends JpaRepository<Allocation, UUID> {
    List<Allocation> findByAffilieId(UUID affilieId);
}
