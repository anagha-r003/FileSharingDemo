package com.fileshare.server.dto.response;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DashboardStats {
    private long totalAssets;
    private long activeShares;
    private long totalAccesses;
}
