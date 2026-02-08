package com.tili.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "compterendu") // Matches DB table name (lowercase in dump)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CompteRendu {

    @Id
    @Column(name = "id")
    private String id;

    @Column(name = "content", length = 5000)
    private String content;

    @Column(name = "createAt")
    private LocalDate createAt;

    @ManyToOne
    @JoinColumn(name = "idMeeting")
    private Meeting meeting;

    @PrePersist
    public void ensureId() {
        if (this.id == null) {
            this.id = UUID.randomUUID().toString();
        }
        if (this.createAt == null) {
            this.createAt = LocalDate.now();
        }
    }
}
