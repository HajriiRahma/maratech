package com.tili.backend.repository;

import com.tili.backend.entity.Document;
import com.tili.backend.enums.DocumentType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentRepository extends JpaRepository<Document, String> {
    long countByDocumentType(DocumentType type);

    List<Document> findTop10ByOrderByCreatedAtDesc();

    List<Document> findByDocumentType(DocumentType type);
}
