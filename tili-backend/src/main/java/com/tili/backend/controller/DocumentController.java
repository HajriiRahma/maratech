package com.tili.backend.controller;

import com.tili.backend.dto.DocumentDTO;
import com.tili.backend.enums.DocumentType;
import com.tili.backend.service.DocumentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/documents")
@CrossOrigin("*")
public class DocumentController {

    @Autowired
    private DocumentService documentService;

    @PostMapping(consumes = { "multipart/form-data" })
    public ResponseEntity<DocumentDTO> uploadDocument(
            @RequestParam("title") String title,
            @RequestParam("type") DocumentType type,
            @RequestParam("userId") String userId,
            @RequestParam(value = "projectId", required = false) String projectId,
            @RequestParam("file") MultipartFile file) throws IOException {
        return ResponseEntity.ok(documentService.uploadDocument(title, type, userId, projectId, file));
    }

    @GetMapping
    public ResponseEntity<List<DocumentDTO>> getAllDocuments() {
        return ResponseEntity.ok(documentService.getAllDocuments());
    }
}
