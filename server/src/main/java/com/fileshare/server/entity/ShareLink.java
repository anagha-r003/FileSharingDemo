package com.fileshare.server.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShareLink {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String token;

    @Column(nullable = false)
    private String recipientEmail;

    private String message;

    @Column(nullable = false)
    private LocalDateTime expiresAt;

    private Boolean accessed = false;

    private Boolean active = true;

    private LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "file_id", nullable = false)
    private UserFile file;

    @ManyToOne
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;
}
