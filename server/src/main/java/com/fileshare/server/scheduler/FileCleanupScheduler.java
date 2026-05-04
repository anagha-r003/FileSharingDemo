package com.fileshare.server.scheduler;

import com.fileshare.server.service.FileService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class FileCleanupScheduler {

    private final FileService fileService;

    // Runs daily at 2 AM
    //@Scheduled(cron = "0 * * * * ?") // every minute
    @Scheduled(cron = "0 0 2 * * ?")
    public void runCleanupJob() {

        log.info("Starting scheduled file cleanup...");

        fileService.deleteExpiredFiles();

        log.info("File cleanup job completed.");
    }
}
