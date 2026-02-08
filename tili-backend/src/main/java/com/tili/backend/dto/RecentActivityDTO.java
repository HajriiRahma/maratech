package com.tili.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecentActivityDTO {
    private String id;
    private String user;
    private String action;
    private String target;
    private String time;
}
