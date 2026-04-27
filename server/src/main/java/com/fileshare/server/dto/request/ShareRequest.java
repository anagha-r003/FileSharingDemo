package com.fileshare.server.dto.request;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ShareRequest {
    private String sharedWithEmail;
    private boolean publicAccess;
    private LocalDateTime expiryTime;
}
