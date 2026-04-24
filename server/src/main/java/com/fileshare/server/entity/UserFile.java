package com.fileshare.server.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fileshare.server.enums.FileType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "files")
public class UserFile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Enumerated(EnumType.STRING)
    private FileType type;

    private Long size;

    @JsonIgnore
    private String path;

    private String description;

    private boolean encrypted;

    private LocalDateTime uploadedAt;

    private LocalDateTime lastModified;

    @ManyToOne
    @JoinColumn(name = "parent_id")
    private UserFile parent;

    @ManyToOne
    @JsonIgnore
    @JoinColumn(name = "user_id")
    private User user;
    
    @PrePersist
    public void onCreate() {
        this.uploadedAt = LocalDateTime.now();
        this.lastModified = LocalDateTime.now();
    }

    @PreUpdate
    public void onUpdate() {
        this.lastModified = LocalDateTime.now();
    }
}
