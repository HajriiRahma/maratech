package com.tili.backend.controller;

import com.tili.backend.dto.LoginRequest;
import com.tili.backend.dto.UserDTO;
import com.tili.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin("*")
public class AuthController {

    @Autowired
    private UserService userService;

    @PostMapping("/login")
    public ResponseEntity<UserDTO> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(userService.authenticate(request.getEmail(), request.getPassword()));
    }
}
