package ma.cimr.admin.service;

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

    @KafkaListener(topics = "notifications-topic", groupId = "admin-group")
    public void consume(NotificationEvent event) {
        log.info("Consumed notification event from Kafka: {}", event);
        
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
    }
}
