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
@Table(name = "share_history")
public class ShareHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Optional reference (NO FK)
    private Long fileId;

    // Snapshot fields
    private String fileName;
    private String fileType;
    private Long fileSize;

    private Long sharedBy;
    private Long sharedTo;

    private LocalDateTime sharedAt;
    private LocalDateTime deletedAt;
}
