package com.tili.backend.dto;

import com.tili.backend.enums.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateUserDTO {
    @NotBlank
    private String name;

    @Email
    @NotBlank
    private String email;
   
    @NotBlank
    private String password;

    private UserRole role;
}
