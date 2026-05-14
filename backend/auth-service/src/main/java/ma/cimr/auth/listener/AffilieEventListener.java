package ma.cimr.auth.listener;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.cimr.auth.event.AffilieEvent;
import ma.cimr.auth.model.User;
import ma.cimr.auth.repository.UserRepository;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Collections;

@Component
@Slf4j
@RequiredArgsConstructor
public class AffilieEventListener {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @KafkaListener(topics = "affilie-events", groupId = "auth-group")
    public void handleAffilieEvent(AffilieEvent event) {
        log.info("Received event for affilie: {}", event.getUsername());
        
        if ("CREATE_ACCOUNT".equals(event.getType())) {
            User user = new User();
            user.setUsername(event.getUsername() != null ? event.getUsername().toUpperCase() : null);
            user.setPassword(passwordEncoder.encode(event.getPassword()));
            user.setEmail(event.getEmail() != null ? event.getEmail().toUpperCase() : null);
            user.setAffilieId(event.getAffilieId());
            user.setCin(event.getCin() != null ? event.getCin().toUpperCase() : null);
            user.setRoles(Collections.singleton(User.Role.ROLE_AFFILIE));
            
            userRepository.save(user);
            log.info("Created user account for: {}", event.getUsername());
        }
    }
}
