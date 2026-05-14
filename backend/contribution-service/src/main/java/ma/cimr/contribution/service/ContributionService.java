package ma.cimr.contribution.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.cimr.contribution.model.Contribution;
import ma.cimr.contribution.model.PointsLedger;
import ma.cimr.contribution.model.PointsPurchase;
import ma.cimr.contribution.model.PointValue;
import ma.cimr.contribution.repository.ContributionRepository;
import ma.cimr.contribution.repository.PointsLedgerRepository;
import ma.cimr.contribution.repository.PointsPurchaseRepository;
import ma.cimr.contribution.repository.PointValueRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class ContributionService {
    private final ContributionRepository contributionRepository;
    private final PointsLedgerRepository pointsLedgerRepository;
    private final PointsPurchaseRepository pointsPurchaseRepository;
    private final PointValueRepository pointValueRepository;

    private static final BigDecimal PLAFOND_CNSS = new BigDecimal("6000.00");
    private static final String UPLOAD_DIR = "uploads/proofs/";

    @Transactional
    public Contribution recordContribution(Contribution contribution) {
        if (contribution.getSalaireMensuel().compareTo(PLAFOND_CNSS) > 0) {
            log.warn("Salaire {} dépasse le plafond CNSS {}, ajustement symbolique peut être requis", 
                    contribution.getSalaireMensuel(), PLAFOND_CNSS);
        }
        Contribution saved = contributionRepository.save(contribution);
        calculateAndRecordPoints(saved);
        return saved;
    }

    private void calculateAndRecordPoints(Contribution contribution) {
        int year = Integer.parseInt(contribution.getPeriode().substring(0, 4));
        Optional<PointValue> pointValueOpt = pointValueRepository.findByYear(year);
        if (pointValueOpt.isEmpty()) return;
        
        BigDecimal pointValue = pointValueOpt.get().getValue();
        BigDecimal totalContribution = contribution.getContributionSalariale().add(contribution.getContributionPatronale());
        
        double points = totalContribution.divide(pointValue, 2, RoundingMode.HALF_UP).doubleValue();
        
        PointsLedger pointsLedger = PointsLedger.builder()
                .affilieId(contribution.getAffilieId())
                .periode(contribution.getPeriode())
                .pointsAcquis(points)
                .dateAttribution(LocalDateTime.now())
                .build();
        
        pointsLedgerRepository.save(pointsLedger);
    }

    @Transactional
    public PointsLedger recordPointsLedger(PointsLedger ledger) {
        if (ledger.getDateAttribution() == null) {
            ledger.setDateAttribution(LocalDateTime.now());
        }
        return pointsLedgerRepository.save(ledger);
    }

    @Transactional
    public PointsPurchase submitPurchaseRequest(UUID affilieId, String affilieNom, Double points, BigDecimal montant, 
                                               String ref, String banque, String dateVirement, MultipartFile file) throws IOException {
        
        String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        Path path = Paths.get(UPLOAD_DIR + fileName);
        Files.createDirectories(path.getParent());
        Files.write(path, file.getBytes());

        PointsPurchase purchase = PointsPurchase.builder()
                .affilieId(affilieId)
                .affilieNom(affilieNom)
                .pointsGranted(points)
                .montantVerse(montant)
                .referenceVirement(ref)
                .banque(banque)
                .dateVirement(LocalDateTime.parse(dateVirement + "T00:00:00"))
                .preuvePath(path.toString())
                .statut("EN_ATTENTE")
                .type("ACHAT_MANUEL")
                .dateAchat(LocalDateTime.now())
                .build();

        return pointsPurchaseRepository.save(purchase);
    }

    @Transactional
    public PointsPurchase validatePurchase(UUID purchaseId) {
        PointsPurchase purchase = pointsPurchaseRepository.findById(purchaseId)
                .orElseThrow(() -> new RuntimeException("Purchase not found"));
        
        purchase.setStatut("VALIDE");
        purchase.setDateValidation(LocalDateTime.now());
        
        // Add points to ledger
        PointsLedger pointsLedger = PointsLedger.builder()
                .affilieId(purchase.getAffilieId())
                .periode(String.valueOf(LocalDateTime.now().getYear()))
                .pointsAcquis(purchase.getPointsGranted())
                .dateAttribution(LocalDateTime.now())
                .build();
        pointsLedgerRepository.save(pointsLedger);
        
        return pointsPurchaseRepository.save(purchase);
    }

    @Transactional
    public PointsPurchase rejectPurchase(UUID purchaseId, String motif) {
        PointsPurchase purchase = pointsPurchaseRepository.findById(purchaseId)
                .orElseThrow(() -> new RuntimeException("Purchase not found"));
        purchase.setStatut("REJETE");
        purchase.setMotifRejet(motif);
        return pointsPurchaseRepository.save(purchase);
    }

    public List<PointsPurchase> getAllPurchases() {
        return pointsPurchaseRepository.findAll();
    }

    public List<PointsPurchase> getPurchasesByAffilie(UUID affilieId) {
        return pointsPurchaseRepository.findByAffilieId(affilieId);
    }

    public List<Contribution> getContributionsByAffilie(UUID affilieId) {
        return contributionRepository.findByAffilieId(affilieId);
    }

    public Map<String, Object> getLivretIndividuel(UUID affilieId) {
        List<Contribution> contributions = contributionRepository.findByAffilieId(affilieId);
        List<PointsLedger> points = pointsLedgerRepository.findByAffilieId(affilieId);
        List<PointsPurchase> purchases = pointsPurchaseRepository.findByAffilieId(affilieId);

        Map<String, Object> livret = new HashMap<>();
        livret.put("affilieId", affilieId);
        livret.put("contributions", contributions);
        livret.put("pointsLedger", points);
        livret.put("pointsPurchase", purchases);
        
        double total = points.stream().mapToDouble(PointsLedger::getPointsAcquis).sum();
        livret.put("totalPoints", total);
        return livret;
    }

    public List<Contribution> getAll() { return contributionRepository.findAll(); }
}
