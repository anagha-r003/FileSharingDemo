package com.fileshare.server.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class RefreshResponse {
    private String accessToken;
    private String refreshToken;
}