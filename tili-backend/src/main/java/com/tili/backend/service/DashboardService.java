package com.tili.backend.service;

import com.tili.backend.dto.DashboardDTO;
import com.tili.backend.enums.DocumentType;
import com.tili.backend.enums.ProjectStatus;
import com.tili.backend.repository.DocumentRepository;
import com.tili.backend.repository.ProjectRepository;
import com.tili.backend.repository.MeetingRepository;
import com.tili.backend.dto.RecentActivityDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class DashboardService {

    @Autowired
    private ProjectRepository projectRepository;
    @Autowired
    private MeetingRepository meetingRepository;
    @Autowired
    private DocumentRepository documentRepository;

    public DashboardDTO getStats() {
        DashboardDTO dto = new DashboardDTO();
        dto.setTotalProjects(projectRepository.count());
        dto.setActiveProjects(projectRepository.countByStatut(ProjectStatus.ACTIVE));
        dto.setClosedProjects(projectRepository.countByStatut(ProjectStatus.CLOTURE));

        dto.setTotalDocuments(documentRepository.count());
        dto.setTotalMeetings(meetingRepository.count());

        Map<String, Long> docsByType = new HashMap<>();
        for (DocumentType type : DocumentType.values()) {
            docsByType.put(type.name(), documentRepository.countByDocumentType(type));
        }
        dto.setDocumentsByType(docsByType);

        dto.setRecentActivities(java.util.List.of(
                new RecentActivityDTO("1", "Alice Smith", "Uploaded a document", "Project Alpha Report", "2 hours ago"),
                new RecentActivityDTO("2", "John Doe", "Created a meeting", "Weekly Sync", "4 hours ago")));

        return dto;
    }
}
