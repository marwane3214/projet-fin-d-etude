package ma.cimr.admin.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.cimr.admin.dto.NotificationEvent;
import ma.cimr.admin.model.Notification;
import ma.cimr.admin.repository.NotificationRepository;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationConsumer {

    private final NotificationRepository notificationRepository;
    private final ObjectMapper objectMapper;

    @KafkaListener(topics = "notifications-topic", groupId = "admin-group")
    public void consume(String message) {
        try {
            log.info("Received raw Kafka message: {}", message);
            NotificationEvent event = objectMapper.readValue(message, NotificationEvent.class);
            log.info("Parsed notification event for user: {}", event.getUserId());

            Notification notification = Notification.builder()
                    .userId(event.getUserId())
                    .title(event.getTitle())
                    .message(event.getMessage())
                    .type(event.getType())
                    .referenceId(event.getReferenceId())
                    .createdAt(LocalDateTime.now())
                    .isRead(false)
                    .build();

            notificationRepository.save(notification);
            log.info("Saved notification to database for user: {}", event.getUserId());

        } catch (Exception e) {
            log.error("Failed to process Kafka message: {}", message, e);
        }
    }
}
