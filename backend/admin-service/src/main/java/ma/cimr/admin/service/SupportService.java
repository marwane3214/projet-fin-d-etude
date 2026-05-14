package ma.cimr.admin.service;

import lombok.RequiredArgsConstructor;
import ma.cimr.admin.dto.SupportTicketRequest;
import ma.cimr.admin.model.SupportTicket;
import ma.cimr.admin.repository.SupportTicketRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SupportService {

    private final SupportTicketRepository repository;
    private final EmailService emailService;

    public SupportTicket submit(SupportTicketRequest req) {
        SupportTicket ticket = SupportTicket.builder()
                .nom(req.getNom())
                .email(req.getEmail())
                .sujet(req.getSujet())
                .message(req.getMessage())
                .statut("OUVERT")
                .createdAt(LocalDateTime.now())
                .build();

        ticket = repository.save(ticket);

        emailService.sendSupportTicketNotification(ticket);
        emailService.sendConfirmationToUser(ticket);

        return ticket;
    }

    public List<SupportTicket> getAll() {
        return repository.findAllByOrderByCreatedAtDesc();
    }

    public SupportTicket resolve(Long id) {
        SupportTicket ticket = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found: " + id));
        ticket.setStatut("RESOLU");
        ticket.setResolvedAt(LocalDateTime.now());
        return repository.save(ticket);
    }

    public long countOpen() {
        return repository.countByStatut("OUVERT");
    }
}
