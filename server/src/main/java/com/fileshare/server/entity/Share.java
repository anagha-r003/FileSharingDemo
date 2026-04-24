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
@Table(name = "shares")
public class Share {
    @Id
    private String id; // UUID

    @ManyToOne
    @JoinColumn(name = "file_id")
    private UserFile file;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    private String sharedWithEmail;

    private boolean publicAccess;

    private LocalDateTime expiryTime;

    private int accessCount;

    private LocalDateTime createdAt;

    @PrePersist
    public void onCreate() {
        if (this.id == null) {
            this.id = java.util.UUID.randomUUID().toString();
        }
        this.createdAt = LocalDateTime.now();
    }
}
