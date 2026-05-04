package com.fileshare.server.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RecycleBinStatsResponse {
    private int totalFiles;
    private int expiringSoon;
    private long spaceUsedMB;
    private int retentionDays;
}
