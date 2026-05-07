package ma.cimr.liquidation.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.cimr.liquidation.dto.NotificationEvent;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationProducer {
    private final KafkaTemplate<String, NotificationEvent> kafkaTemplate;
    private static final String TOPIC = "notifications-topic";

    public void sendNotification(NotificationEvent event) {
        log.info("Sending notification event to Kafka: {}", event);
        kafkaTemplate.send(TOPIC, event);
    }
}
