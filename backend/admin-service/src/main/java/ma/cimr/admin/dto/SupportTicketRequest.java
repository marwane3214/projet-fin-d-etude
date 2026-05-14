package ma.cimr.admin.dto;

import lombok.Data;

@Data
public class SupportTicketRequest {
    private String nom;
    private String email;
    private String sujet;
    private String message;
}
