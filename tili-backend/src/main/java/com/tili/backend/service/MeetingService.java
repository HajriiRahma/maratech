package com.tili.backend.service;

import com.tili.backend.dto.MeetingDTO;
import com.tili.backend.entity.Meeting;
import com.tili.backend.entity.Project;
import com.tili.backend.repository.MeetingRepository;
import com.tili.backend.repository.ProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class MeetingService {

    @Autowired
    private MeetingRepository meetingRepository;

    @Autowired
    private ProjectRepository projectRepository;

    public MeetingDTO createMeeting(MeetingDTO dto) {
        Meeting meeting = new Meeting();
        meeting.setDate(dto.getDate());
        meeting.setSujet(dto.getTitle());
        meeting.setLocation(dto.getLocation());

        if (dto.getProjectId() != null) {
            Project p = projectRepository.findById(dto.getProjectId()).orElse(null);
            meeting.setProject(p);
        }

        Meeting saved = meetingRepository.save(meeting);
        return mapToDTO(saved);
    }

    public List<MeetingDTO> getAllMeetings() {
        return meetingRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private MeetingDTO mapToDTO(Meeting meeting) {
        MeetingDTO dto = new MeetingDTO();
        dto.setId(meeting.getId());
        dto.setDate(meeting.getDate());
        dto.setTitle(meeting.getSujet());
        dto.setLocation(meeting.getLocation() != null ? meeting.getLocation() : "TBD");

        if (meeting.getDate() != null) {
            dto.setMonth(meeting.getDate().getMonth().name().substring(0, 3));
            dto.setDay(String.format("%02d", meeting.getDate().getDayOfMonth()));
            dto.setTime(String.format("%02d:%02d AM", meeting.getDate().getHour(), meeting.getDate().getMinute()));
        }

        dto.setParticipants(java.util.List.of("Alice", "Bob")); // Mock participants
        dto.setOnline(meeting.getLocation() != null && meeting.getLocation().toLowerCase().contains("http"));

        if (meeting.getProject() != null) {
            dto.setProjectId(meeting.getProject().getId());
            dto.setProjectName(meeting.getProject().getName());
        }
        return dto;
    }
}
