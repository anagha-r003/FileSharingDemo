package com.fileshare.server.service;

import com.fileshare.server.dto.response.DashboardStats;
import com.fileshare.server.repository.FileRepository;
import com.fileshare.server.repository.ShareRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final FileRepository fileRepository;
    private final ShareRepository shareRepository;

    public DashboardStats getStats(Long userId) {

        long totalAssets = fileRepository.countByUserId(userId);

        long activeShares = shareRepository
                .countByUserIdAndExpiryTimeAfter(userId, LocalDateTime.now());

        long totalAccesses = shareRepository.getTotalAccesses(userId);

        return DashboardStats.builder()
                .totalAssets(totalAssets)
                .activeShares(activeShares)
                .totalAccesses(totalAccesses)
                .build();
    }
}
