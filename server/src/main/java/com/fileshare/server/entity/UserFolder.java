package com.fileshare.server.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserFolder {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String name;

    private String path;

    @Column(nullable = true)
    private String relativePath;

    @ManyToOne
    @JoinColumn(name = "parent_id", nullable = true)
    private UserFolder parent;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    private LocalDateTime createdAt;
}
