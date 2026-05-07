package ma.cimr.affiliation.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AffilieEvent {
    private String type; // CREATE_ACCOUNT
    private UUID affilieId;
    private String username;
    private String password;
    private String email;
}
