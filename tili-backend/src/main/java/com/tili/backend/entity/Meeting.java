package com.tili.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "meeting")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Meeting {

    @Id
    @Column(name = "id")
    private String id;

    @Column(name = "date")
    private LocalDateTime date;

    @Column(name = "sujet", length = 5000)
    private String sujet;

    @Column(name = "location")
    private String location;

    // This column exists in DB, possibly a summary or file path.
    // The detailed report is in CompteRendu table.
    @Column(name = "compteRendu")
    private String compteRenduSummary;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "idProjet", nullable = true) // Nullable if meeting not linked to project
    private Project project;

    // @OneToMany(mappedBy = "meeting", cascade = CascadeType.ALL)
    // private List<CompteRendu> detailedReports;

    @PrePersist
    public void ensureId() {
        if (this.id == null) {
            this.id = UUID.randomUUID().toString();
        }
    }
}
