package com.fileshare.server.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ShareLinkResponse {

    private String shareUrl;

    private String recipientEmail;

    private String fileName;

    private LocalDateTime expiresAt;

    private Boolean accessed;

    private String viewUrl;

    private String downloadUrl;
}
