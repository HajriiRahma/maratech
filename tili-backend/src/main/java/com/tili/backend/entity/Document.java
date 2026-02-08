package com.tili.backend.entity;

import com.tili.backend.enums.DocumentType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "document")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Document {

    @Id
    @Column(name = "id")
    private String id;

    @Column(name = "titre")
    private String titre;

    @Column(name = "filePath")
    private String filePath;

    @Column(name = "ceatedAt") // Matches typo in DB
    private LocalDateTime createdAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "documentType")
    private DocumentType documentType;

    @ManyToOne
    @JoinColumn(name = "idUser")
    private User uploadedBy;

    @ManyToOne
    @JoinColumn(name = "idProjet", nullable = true)
    private Project project;

    @PrePersist
    public void ensureId() {
        if (this.id == null) {
            this.id = UUID.randomUUID().toString();
        }
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
    }
}
