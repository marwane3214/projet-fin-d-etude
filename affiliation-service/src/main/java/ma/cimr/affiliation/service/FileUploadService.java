package ma.cimr.affiliation.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
@Slf4j
public class FileUploadService {
    // Utiliser un chemin absolu dans le projet pour éviter les problèmes de "current directory"
    private final String uploadDir = "uploads/justificatifs";
    private final Path rootLocation = Paths.get(System.getProperty("user.dir")).resolve(uploadDir);

    public FileUploadService() {
        try {
            Files.createDirectories(rootLocation);
            log.info("Stockage initialisé à : " + rootLocation.toAbsolutePath());
        } catch (IOException e) {
            log.error("Erreur lors de la création du dossier d'upload", e);
        }
    }

    public String storeFile(MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new IOException("Fichier vide");
        }
        
        String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename().replaceAll("\\s", "_");
        Path targetLocation = rootLocation.resolve(fileName);
        
        try {
            Files.copy(file.getInputStream(), targetLocation);
            log.info("Fichier stocké : " + targetLocation.toAbsolutePath());
            return fileName;
        } catch (IOException e) {
            log.error("Erreur lors de la sauvegarde du fichier", e);
            throw e;
        }
    }

    public Path getFilePath(String fileName) {
        return rootLocation.resolve(fileName);
    }
}
