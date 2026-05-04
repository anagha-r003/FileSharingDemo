package com.fileshare.server.controller;

import com.fileshare.server.dto.request.LoginRequest;
import com.fileshare.server.dto.request.RegisterRequest;
import com.fileshare.server.dto.ResponseStructure;
import com.fileshare.server.dto.response.LoginResponse;
import com.fileshare.server.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.fileshare.server.dto.request.RefreshRequest;
import com.fileshare.server.dto.response.RefreshResponse;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ResponseStructure<String>> register(
            @Valid @RequestBody RegisterRequest request
    ) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public ResponseEntity<ResponseStructure<LoginResponse>> login(
            @Valid @RequestBody LoginRequest request
    ) {
        return authService.login(request);
    }
    @PostMapping("/refresh")
    public ResponseEntity<ResponseStructure<RefreshResponse>> refresh(
            @Valid @RequestBody RefreshRequest request
    ) {
        return authService.refresh(request);
    }
}
