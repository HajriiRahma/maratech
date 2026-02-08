package com.tili.backend.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class ProjectDTO {
    private String id;
    private String title; // name -> title
    private String description;
    private String status; // statut -> status (String)
    private int progress;
    private java.util.List<String> team;
    private String deadline; // formatted date
    private LocalDate startDate;
    private LocalDate endDate;
}
