package ma.cimr.contribution.service;

import lombok.RequiredArgsConstructor;
import ma.cimr.contribution.model.PointValue;
import ma.cimr.contribution.repository.PointValueRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PointValueService {
    private final PointValueRepository pointValueRepository;

    public PointValue savePointValue(PointValue pointValue) {
        return pointValueRepository.findByYear(pointValue.getYear())
                .map(existing -> {
                    existing.setValue(pointValue.getValue());
                    return pointValueRepository.save(existing);
                })
                .orElseGet(() -> pointValueRepository.save(pointValue));
    }

    public Optional<PointValue> getPointValueByYear(Integer year) {
        return pointValueRepository.findByYear(year);
    }

    public List<PointValue> getAllPointValues() {
        return pointValueRepository.findAll();
    }

    public void deletePointValue(Long id) {
        pointValueRepository.deleteById(id);
    }
}