package com.tili.backend.dto;

import lombok.Data;

@Data
public class DocumentDTO {
    private String id;
    private String name; // titre -> name
    private String filePath;
    private String date; // createdAt -> date (String for easy display)
    private String type; // documentType -> type (String)
    private String size; // new field
    private String uploadedByUserFullName; // renamed back for logic
    private String projectId;
    private String projectName;
}
