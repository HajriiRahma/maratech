package com.tili.backend.dto;

import lombok.Data;
import java.util.Map;

@Data
public class DashboardDTO {
    private long totalProjects;
    private long activeProjects;
    private long closedProjects;
    private long totalDocuments;
    private long totalMeetings; // Added
    private Map<String, Long> documentsByType;
    private java.util.List<RecentActivityDTO> recentActivities; // Added
}
