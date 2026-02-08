package com.tili.backend.dto;

import com.tili.backend.enums.UserRole;
import lombok.Data;

@Data
public class UserDTO {
    private String id;
    private String name;
    private String email;
    private UserRole role;
    private String token; // For simple token or session ID in response
}
