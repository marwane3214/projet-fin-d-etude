package ma.cimr.saga.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class LiquidationSagaOrchestrator {
    private final KafkaTemplate<String, String> kafkaTemplate;

    /**
     * Step 1: Liquidation Requested
     */
    @KafkaListener(topics = "liquidation-requested", groupId = "saga-group")
    public void handleLiquidationRequested(String event) {
        log.info("SAGA: Liquidation requested. Step 1: Validating contributions...");
        // Logic to trigger contribution validation in contribution-service
        kafkaTemplate.send("validate-contributions", event);
    }

    /**
     * Step 2: Contributions Validated
     */
    @KafkaListener(topics = "contributions-validated", groupId = "saga-group")
    public void handleContributionsValidated(String event) {
        log.info("SAGA: Contributions validated. Step 2: Reserving points...");
        kafkaTemplate.send("reserve-points", event);
    }

    /**
     * Step 3: Points Reserved
     */
    @KafkaListener(topics = "points-reserved", groupId = "saga-group")
    public void handlePointsReserved(String event) {
        log.info("SAGA: Points reserved. Step 3: Computing pension...");
        kafkaTemplate.send("compute-pension", event);
    }

    /**
     * Step 4: Pension Computed -> Finalize
     */
    @KafkaListener(topics = "pension-computed", groupId = "saga-group")
    public void handlePensionComputed(String event) {
        log.info("SAGA: Pension computed. Step 4: Scheduling first payment...");
        kafkaTemplate.send("schedule-initial-payment", event);
    }

    // Compensating actions for failure
    @KafkaListener(topics = "liquidation-failed", groupId = "saga-group")
    public void handleFailure(String event) {
        log.error("SAGA FAILURE: Executing compensating actions (rolling back points, etc)...");
        kafkaTemplate.send("rollback-liquidation", event);
    }
}
