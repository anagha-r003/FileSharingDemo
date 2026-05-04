package com.fileshare.server.service;
import com.fileshare.server.dto.request.LoginRequest;
import com.fileshare.server.dto.request.RefreshRequest;
import com.fileshare.server.dto.response.RefreshResponse;
import com.fileshare.server.dto.request.RegisterRequest;
import com.fileshare.server.dto.ResponseStructure;
import com.fileshare.server.dto.response.LoginResponse;
import com.fileshare.server.entity.User;
import com.fileshare.server.exception.EmailAlreadyExistsException;
import com.fileshare.server.exception.InvalidCredentialsException;
import com.fileshare.server.exception.PasswordMismatchException;
import com.fileshare.server.exception.UserNotFoundException;
import com.fileshare.server.jwt.JwtService;
import com.fileshare.server.repository.UserRepository;
import com.fileshare.server.util.ResponseBuilder;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public ResponseEntity<ResponseStructure<String>> register(
            RegisterRequest request
    ) {

        log.info("Registration request received for email: {}", request.getEmail());

        if (!request.getPassword().equals(request.getConfirmPassword())) {
            log.warn("Password mismatch for email: {}", request.getEmail());
            throw new PasswordMismatchException("Passwords do not match");
        }

        userRepository.findByEmail(request.getEmail())
                .ifPresent(existingUser -> {
                    log.warn("Duplicate registration attempt for email: {}", request.getEmail());
                    throw new EmailAlreadyExistsException("Email already registered");
                });

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                . storageLimit(1024L * 1024 * 1024)
                .dob(request.getDob())
                .build();

        userRepository.save(user);

        log.info("User registered successfully: {}", request.getEmail());

        return ResponseBuilder.build(
                HttpStatus.CREATED,
                "Registration Successful",
                null
        );
    }

    public ResponseEntity<ResponseStructure<LoginResponse>> login(
            LoginRequest request
    ) {
        log.info("Login request received for email: {}", request.getEmail());

        // Check if user exists
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> {
                    log.warn("Login failed - user not found: {}", request.getEmail());
                    return new UserNotFoundException("User not Registered");
                });

        // Password check
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            log.warn("Login failed - invalid password for email: {}", request.getEmail());
            throw new InvalidCredentialsException("Invalid email or password");
        }

        // Generate tokens
        String accessToken = jwtService.generateAccessToken(user.getEmail());
        String refreshToken = jwtService.generateRefreshToken(user.getEmail());

        log.info("Login successful for email: {}", request.getEmail());

        // Response payload
        LoginResponse response = LoginResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .build();

        return ResponseBuilder.build(
                HttpStatus.OK,
                "Login Successful",
                response
        );
    }
    public ResponseEntity<ResponseStructure<RefreshResponse>> refresh(RefreshRequest request) {
        log.info("Token refresh request received");

        String refreshToken = request.getRefreshToken();

        // Reject if token is invalid/expired or is not a refresh type token
        if (!jwtService.isTokenValid(refreshToken) || !jwtService.isRefreshToken(refreshToken)) {
            log.warn("Refresh failed - invalid or expired refresh token");
            throw new InvalidCredentialsException("Invalid or expired refresh token");
        }

        String email = jwtService.extractUsername(refreshToken);

        // Make sure user still exists in DB
        userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    log.warn("Refresh failed - user not found: {}", email);
                    return new UserNotFoundException("User not found");
                });

        // Issue brand new tokens (refresh token rotation)
        String newAccessToken  = jwtService.generateAccessToken(email);
        String newRefreshToken = jwtService.generateRefreshToken(email);

        log.info("Tokens refreshed successfully for: {}", email);

        RefreshResponse response = RefreshResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .build();

        return ResponseBuilder.build(HttpStatus.OK, "Token Refreshed", response);
    }
}
