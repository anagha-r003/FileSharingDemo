package com.fileshare.server.service;

import com.fileshare.server.dto.ResponseStructure;
import com.fileshare.server.dto.response.RecycleBinStatsResponse;
import com.fileshare.server.dto.response.StorageStatsResponse;
import com.fileshare.server.entity.Share;
import com.fileshare.server.entity.ShareHistory;
import com.fileshare.server.entity.User;
import com.fileshare.server.entity.UserFile;
import com.fileshare.server.exception.FileNotFoundException;
import com.fileshare.server.exception.StorageLimitExceededException;
import com.fileshare.server.exception.UnauthorizedAccessException;
import com.fileshare.server.repository.FileRepository;
import com.fileshare.server.repository.ShareHistoryRepository;
import com.fileshare.server.repository.ShareRepository;
import com.fileshare.server.repository.UserRepository;
import com.fileshare.server.util.ResponseBuilder;
import com.fileshare.server.util.SecurityUtil;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class FileService {
    private final FileRepository fileRepository;
    private final UserRepository userRepository;
    private final ShareRepository shareRepository;
    private final ShareHistoryRepository shareHistoryRepository;

    @Value("${file.upload-dir}")
    private String uploadDir;

    @Autowired
    private FilePreview filePreviewService;


    @Transactional
    public ResponseEntity<ResponseStructure<String>> uploadFile(List<MultipartFile> files) throws IOException {
        log.info("File upload request received");

        User user = SecurityUtil.getCurrentUser();
        if (user.getStorageUsed() == null)  user.setStorageUsed(0L);
        if (user.getStorageLimit() == null) user.setStorageLimit(1L * 1024 * 1024 * 1024);

        long totalSize = files.stream().mapToLong(MultipartFile::getSize).sum();
        if (user.getStorageUsed() + totalSize > user.getStorageLimit())
            throw new StorageLimitExceededException("Storage limit exceeded!");

        new File(uploadDir).mkdirs();
        new File(uploadDir + "previews/").mkdirs();

        for (MultipartFile file : files) {
            String originalName = file.getOriginalFilename() != null
                    ? file.getOriginalFilename().replaceAll("\\s+", "_") : "file";

            String fileName  = UUID.randomUUID() + "_" + originalName;
            String filePath  = Paths.get(uploadDir, fileName).toString();
            file.transferTo(new File(filePath));

            String mimeType = file.getContentType() != null
                    ? file.getContentType() : "application/octet-stream";

            // Generate thumbnail at upload time — null for video/zip/doc
            String previewPath = filePreviewService.generatePreview(filePath, fileName, mimeType);

            fileRepository.save(UserFile.builder()
                    .name(originalName)
                    .size(file.getSize())
                    .path(filePath)
                    .mimeType(mimeType)
                    .previewPath(previewPath)   // stored in DB, null if not supported
                    .isDeleted(false)
                    .user(user)
                    .build());
        }

        user.setStorageUsed(user.getStorageUsed() + totalSize);
        userRepository.save(user);

        return ResponseBuilder.build(HttpStatus.OK, "Files uploaded successfully", null);
    }

    public ResponseEntity<ResponseStructure<List<UserFile>>> getUserFiles() {

        log.info("Fetching user files");

        User user = SecurityUtil.getCurrentUser();
        Pageable pageable = PageRequest.of(0, 10);
        Page<UserFile> page = fileRepository.findByUserIdAndIsDeletedFalse(user.getId(), pageable);
        List<UserFile> files = page.getContent();

        return ResponseBuilder.build(
                HttpStatus.OK,
                "Files fetched successfully",
                files
        );
    }

    public ResponseEntity<Resource> downloadFile(Long fileId) throws IOException {

        log.info("Download request for fileId: {}", fileId);

        // Get logged-in user
        User user = SecurityUtil.getCurrentUser();

        // Fetch file from DB
        UserFile file = fileRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("File not found"));

        if (!file.getUser().getId().equals(user.getId())) {
            throw new UnauthorizedAccessException("Unauthorized access to file");
        }

        // Get file path
        Path path = Paths.get(file.getPath());

        // Convert to resource
        Resource resource = new UrlResource(path.toUri());

        if (!resource.exists()) {
            throw new RuntimeException("File not found on server");
        }

        // Return file as response
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + file.getName() + "\"")
                .body(resource);
    }

    @Transactional
    public ResponseEntity<ResponseStructure<String>> deleteFile(Long fileId) {

        log.info("Delete request for fileId: {}", fileId);

        // Get logged-in user
        User user = SecurityUtil.getCurrentUser();

        // Fetch file
        UserFile file = fileRepository.findById(fileId)
                .orElseThrow(() -> new FileNotFoundException("File not found"));

        // Authorization check
        if (!file.getUser().getId().equals(user.getId())) {
            throw new UnauthorizedAccessException("Unauthorized access");
        }

        // Soft delete (move to recycle bin)
        file.setIsDeleted(true);
        file.setDeletedAt(LocalDateTime.now());
        user.setStorageUsed(
                Math.max(0, user.getStorageUsed() - file.getSize())
        );

        fileRepository.save(file);
        userRepository.save(user);

        return ResponseBuilder.build(
                HttpStatus.OK,
                "File moved to Recycle Bin",
                null
        );
    }

    public ResponseEntity<ResponseStructure<List<UserFile>>> getDeletedFiles() {

        User user = SecurityUtil.getCurrentUser();

        List<UserFile> files = fileRepository
                .findByUserIdAndIsDeletedTrue(user.getId());

        return ResponseBuilder.build(
                HttpStatus.OK,
                "Deleted files fetched successfully",
                files
        );
    }

    @Transactional
    public ResponseEntity<ResponseStructure<String>> restoreFile(Long fileId) {

        log.info("Restore request for fileId: {}", fileId);
        User user = SecurityUtil.getCurrentUser();

        UserFile file = getAuthorizedDeletedFile(fileId);

        file.setIsDeleted(false);
        file.setDeletedAt(null);
        user.setStorageUsed(user.getStorageUsed() + file.getSize());


        fileRepository.save(file);
        userRepository.save(user);

        return ResponseBuilder.build(
                HttpStatus.OK,
                "File restored successfully",
                null
        );
    }


    @Transactional
    public ResponseEntity<ResponseStructure<String>> permanentlyDeleteFile(Long fileId) {

        log.info("Permanent delete request for fileId: {}", fileId);
        User user = SecurityUtil.getCurrentUser();

        UserFile file = getAuthorizedDeletedFile(fileId);

        // Fetch all shares
        List<Share> shares = shareRepository.findByFileId(fileId);

        // Convert to ShareHistory
        List<ShareHistory> historyList = shares.stream().map(share ->
                ShareHistory.builder()
                        .fileId(file.getId()) // optional reference
                        .fileName(file.getName())
                        .fileType(file.getType().name())
                        .fileSize(file.getSize())
                        .sharedBy(share.getUser().getId())
                        .sharedAt(share.getCreatedAt())
                        .deletedAt(LocalDateTime.now())
                        .build()
        ).toList();

        //Save to history table
        shareHistoryRepository.saveAll(historyList);

        // Delete from share table
        shareRepository.deleteAll(shares);

        // Delete physical file from disk
        File diskFile = new File(file.getPath());
        if (diskFile.exists()) {
            diskFile.delete();
        }

        // Update storage
        user.setStorageUsed(
                Math.max(0, user.getStorageUsed() - file.getSize())
        );
        userRepository.save(user);

        // Delete file from DB
        fileRepository.delete(file);

        return ResponseBuilder.build(
                HttpStatus.OK,
                "File permanently deleted",
                null
        );
    }

    @Transactional
    public ResponseEntity<ResponseStructure<Map<String, Object>>> restoreAllFiles() {

        User user = SecurityUtil.getCurrentUser();

        List<UserFile> files =
                fileRepository.findByUserIdAndIsDeletedTrue(user.getId());

        int restoredCount = 0;
        long totalRestoredSize = 0;

        for (UserFile file : files) {
            file.setIsDeleted(false);
            file.setDeletedAt(null);
            totalRestoredSize += file.getSize();
            restoredCount++;
        }

        fileRepository.saveAll(files);

        user.setStorageUsed(
                (user.getStorageUsed() == null ? 0 : user.getStorageUsed())
                        + totalRestoredSize
        );

        userRepository.save(user);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "All files restored successfully");
        response.put("restoredCount", restoredCount);

        return ResponseBuilder.build(
                HttpStatus.OK,
                "Restore completed",
                response
        );
    }

    @Transactional
    public ResponseEntity<ResponseStructure<Map<String, Object>>> emptyRecycleBin() {

        User user = SecurityUtil.getCurrentUser();

        List<UserFile> files =
                fileRepository.findByUserIdAndIsDeletedTrue(user.getId());

        int deletedCount = 0;

        for (UserFile file : files) {

            // delete physical file
            File diskFile = new File(file.getPath());
            if (diskFile.exists()) {
                diskFile.delete();
            }

            user.setStorageUsed(
                    Math.max(0, user.getStorageUsed() - file.getSize())
            );

            deletedCount++;
        }

        fileRepository.deleteAll(files);
        userRepository.save(user);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Recycle bin emptied");
        response.put("deletedCount", deletedCount);

        return ResponseBuilder.build(
                HttpStatus.OK,
                "Recycle bin cleared",
                response
        );
    }

    public ResponseEntity<ResponseStructure<RecycleBinStatsResponse>> getRecycleBinStats() {

        User user = SecurityUtil.getCurrentUser();

        List<UserFile> files =
                fileRepository.findByUserIdAndIsDeletedTrue(user.getId());

        int totalFiles = files.size();
        int expiringSoon = 0;
        long totalSizeBytes = 0;

        int retentionDays = 30;
        LocalDateTime now = LocalDateTime.now();

        for (UserFile file : files) {

            totalSizeBytes += file.getSize();

            if (file.getDeletedAt() != null) {
                long days = ChronoUnit.DAYS.between(file.getDeletedAt(), now);

                // improved condition (avoid negative cases)
                if (days <= retentionDays && (retentionDays - days) <= 5) {
                    expiringSoon++;
                }
            }
        }

        long spaceUsedMB = totalSizeBytes / (1024 * 1024);

        RecycleBinStatsResponse response = RecycleBinStatsResponse.builder()
                .totalFiles(totalFiles)
                .expiringSoon(expiringSoon)
                .spaceUsedMB(spaceUsedMB)
                .retentionDays(retentionDays)
                .build();

        return ResponseBuilder.build(
                HttpStatus.OK,
                "Recycle bin stats fetched",
                response
        );
    }

    public ResponseEntity<Resource> getPreviewThumbnail(Long fileId) throws IOException {
        log.info("Preview thumbnail request for fileId: {}", fileId);

        UserFile file = fileRepository.findById(fileId)
                .orElseThrow(() -> new FileNotFoundException("File not found"));

        // No thumbnail for this file type
        if (file.getPreviewPath() == null)
            return ResponseEntity.notFound().build();

        Path thumbPath = Paths.get(uploadDir).resolve(file.getPreviewPath());
        Resource resource = new UrlResource(thumbPath.toUri());

        if (!resource.exists())
            return ResponseEntity.notFound().build();

        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_JPEG)
                .header(HttpHeaders.CACHE_CONTROL, "max-age=86400") // cache 1 day
                .body(resource);
    }

    public ResponseEntity<Resource> viewFile(Long fileId) throws IOException {
        log.info("View request for fileId: {}", fileId);

        UserFile file = getAuthorizedFile(fileId);
        Path filePath = Paths.get(file.getPath());
        Resource resource = new UrlResource(filePath.toUri());

        if (!resource.exists())
            return ResponseEntity.notFound().build();

        String contentType = file.getMimeType() != null
                ? file.getMimeType() : "application/octet-stream";

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + file.getName() + "\"")
                .header(HttpHeaders.CACHE_CONTROL, "max-age=3600")
                .body(resource);
    }

    public ResponseEntity<ResponseStructure<String>> starFile(Long fileId) {

        log.info("Star request for fileId: {}", fileId);

        UserFile file = getAuthorizedFile(fileId);

        file.setIsStarred(true);
        fileRepository.save(file);

        return ResponseBuilder.build(
                HttpStatus.OK,
                "File marked as starred",
                null
        );
    }

    public ResponseEntity<ResponseStructure<String>> unstarFile(Long fileId) {

        log.info("Unstar request for fileId: {}", fileId);

        UserFile file = getAuthorizedFile(fileId);

        file.setIsStarred(false);
        fileRepository.save(file);

        return ResponseBuilder.build(
                HttpStatus.OK,
                "File removed from starred",
                null
        );
    }

    public ResponseEntity<ResponseStructure<List<UserFile>>> getStarredFiles() {

        log.info("Fetching starred files");

        User user = SecurityUtil.getCurrentUser();

        List<UserFile> files = fileRepository
                .findByUserIdAndIsDeletedFalseAndIsStarredTrue(user.getId());

        return ResponseBuilder.build(
                HttpStatus.OK,
                "Starred files fetched successfully",
                files
        );
    }


    private UserFile getAuthorizedFile(Long fileId) {
        User user = SecurityUtil.getCurrentUser();

        return fileRepository.findByIdAndUserId(fileId, user.getId())
                .orElseThrow(() -> new UnauthorizedAccessException("Unauthorized or not found"));
    }

    private UserFile getAuthorizedDeletedFile(Long fileId) {

        User user = SecurityUtil.getCurrentUser();

        return fileRepository
                .findByIdAndUserIdAndIsDeletedTrue(fileId, user.getId())
                .orElseThrow(() -> new IllegalStateException("File not in recycle bin or unauthorized"));
    }

    @Transactional
    public void deleteExpiredFiles() {

        int RETENTION_DAYS = 30;

        LocalDateTime expiryTime = LocalDateTime.now().minusDays(RETENTION_DAYS);

        List<UserFile> expiredFiles =
                fileRepository.findByIsDeletedTrueAndDeletedAtBefore(expiryTime);

        log.info("Found {} expired files", expiredFiles.size());

        for (UserFile file : expiredFiles) {

            // 1. Delete physical file
            File diskFile = new File(file.getPath());
            if (diskFile.exists()) {
                diskFile.delete();
            }

            // 2. Update user storage
            User user = file.getUser();
            if (user.getStorageUsed() != null) {
                user.setStorageUsed(user.getStorageUsed() - file.getSize());
                userRepository.save(user);
            }
        }

        // 3. Delete from DB
        fileRepository.deleteAll(expiredFiles);

        log.info("Deleted {} expired files successfully", expiredFiles.size());
    }




}
