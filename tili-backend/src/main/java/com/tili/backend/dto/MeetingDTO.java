package com.tili.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class MeetingDTO {
    private String id;
    private LocalDateTime date;
    private String month; // OCT
    private String day; // 25
    private String time; // 10:00 AM
    private String title; // sujet -> title
    private String location;
    private java.util.List<String> participants;
    private boolean isOnline;
    private String projectId;
    private String projectName;
}
