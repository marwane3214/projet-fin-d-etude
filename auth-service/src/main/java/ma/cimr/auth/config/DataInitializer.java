package ma.cimr.auth.config;

import lombok.RequiredArgsConstructor;
import ma.cimr.auth.model.User;
import ma.cimr.auth.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.util.Set;

@Configuration
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        userRepository.findByUsername("MOHAMED.ALAMI").ifPresent(u -> {
            u.setAffilieId(java.util.UUID.fromString("2680e6d1-1a9b-4e9d-bb5d-7bafc0c970a4"));
            userRepository.save(u);
        });

        if (userRepository.count() == 0) {
            // Create Affiliate User
            User affilie = User.builder()
                    .username("MOHAMED.ALAMI")
                    .password(passwordEncoder.encode("cimr2024"))
                    .email("M.ALAMI@EMAIL.MA")
                    .cin("BW32472") 
                    .affilieId(java.util.UUID.fromString("2680e6d1-1a9b-4e9d-bb5d-7bafc0c970a4"))
                    .roles(Set.of(User.Role.ROLE_AFFILIE))
                    .build();

            // Create Company Admin User
            User admin = User.builder()
                    .username("TECHMAROC.ADMIN")
                    .password(passwordEncoder.encode("admin2024"))
                    .email("ADMIN@TECHMAROC.MA")
                    .roles(Set.of(User.Role.ROLE_ADMIN))
                    .build();

            userRepository.save(affilie);
            userRepository.save(admin);
            
            System.out.println("CIMR: Default test users initialized.");
            System.out.println("Affilié: mohamed.alami / cimr2024");
            System.out.println("Entreprise: techmaroc.admin / admin2024");
        }
    }
}
