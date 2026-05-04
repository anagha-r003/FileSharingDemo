package com.fileshare.server.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ShareResponse {
    private String shareId;
    private String fileName;
    private boolean publicAccess;
    private LocalDateTime expiryTime;
    private int accessCount;
}
