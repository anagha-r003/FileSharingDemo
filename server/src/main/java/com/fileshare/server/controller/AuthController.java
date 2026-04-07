package com.fileshare.server.controller;

import com.fileshare.server.dto.RegisterRequest;
import com.fileshare.server.dto.ResponseStructure;
import com.fileshare.server.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
}
