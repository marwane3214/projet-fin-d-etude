package ma.cimr.contribution.repository;

import ma.cimr.contribution.model.PointValue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PointValueRepository extends JpaRepository<PointValue, Long> {
    Optional<PointValue> findByYear(Integer year);
}