package ma.cimr.reversion.service;

import lombok.RequiredArgsConstructor;
import ma.cimr.reversion.model.AyantDroit;
import ma.cimr.reversion.repository.AyantDroitRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReversionService {
    private final AyantDroitRepository ayantDroitRepository;

    public List<AyantDroit> getAllAyantsDroit() {
        return ayantDroitRepository.findAll();
    }

    public AyantDroit getById(UUID id) {
        return ayantDroitRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("AyantDroit not found: " + id));
    }

    public List<AyantDroit> getAyantsDroitByAffilie(UUID affilieId) {
        return ayantDroitRepository.findByAffilieDecedeId(affilieId);
    }

    @Transactional
    public AyantDroit createAyantDroit(AyantDroit ayantDroit) {
        // CIMR Art 39: Reversion is 50% for spouse, etc. (Business logic trigger)
        return ayantDroitRepository.save(ayantDroit);
    }

    @Transactional
    public AyantDroit updateStatus(UUID id, String statut, String motif) {
        AyantDroit ayantDroit = getById(id);
        // Store status update - isEligible acts as the status flag
        if (statut != null) {
            ayantDroit.setIsEligible("VALIDE".equals(statut) || "APPROVED".equals(statut));
        }
        return ayantDroitRepository.save(ayantDroit);
    }
}
