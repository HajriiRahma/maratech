package com.tili.backend.service;

import com.tili.backend.dto.DocumentDTO;
import com.tili.backend.entity.Document;
import com.tili.backend.entity.Project;
import com.tili.backend.entity.User;
import com.tili.backend.enums.DocumentType;
import com.tili.backend.repository.DocumentRepository;
import com.tili.backend.repository.ProjectRepository;
import com.tili.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class DocumentService {

    @Autowired
    private DocumentRepository documentRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private ProjectRepository projectRepository;

    private final Path rootLocation = Paths.get("uploads");

    public DocumentDTO uploadDocument(String title, DocumentType type, String userId, String projectId,
            MultipartFile file) throws IOException {
        // Ensure upload directory exists
        if (!Files.exists(rootLocation)) {
            Files.createDirectories(rootLocation);
        }

        String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        Path destinationFile = this.rootLocation.resolve(Paths.get(fileName)).normalize().toAbsolutePath();
        file.transferTo(destinationFile);

        Document doc = new Document();
        doc.setTitre(title);
        doc.setDocumentType(type);
        doc.setFilePath(destinationFile.toString());
        doc.setCreatedAt(LocalDateTime.now());

        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        doc.setUploadedBy(user);

        if (projectId != null && !projectId.isEmpty()) {
            Project project = projectRepository.findById(projectId).orElse(null);
            doc.setProject(project);
        }

        Document saved = documentRepository.save(doc);
        return mapToDTO(saved);
    }

    public List<DocumentDTO> getAllDocuments() {
        return documentRepository.findAll().stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    private DocumentDTO mapToDTO(Document doc) {
        DocumentDTO dto = new DocumentDTO();
        dto.setId(doc.getId());
        dto.setName(doc.getTitre());
        dto.setFilePath(doc.getFilePath());
        dto.setDate(doc.getCreatedAt() != null ? doc.getCreatedAt().toLocalDate().toString() : "");
        dto.setType(doc.getDocumentType() != null ? doc.getDocumentType().name() : "Other");
        dto.setSize("1.5 MB"); // Fallback mock size
        if (doc.getUploadedBy() != null) {
            dto.setUploadedByUserFullName(doc.getUploadedBy().getName());
        }
        if (doc.getProject() != null) {
            dto.setProjectId(doc.getProject().getId());
            dto.setProjectName(doc.getProject().getName());
        }
        return dto;
    }
}
