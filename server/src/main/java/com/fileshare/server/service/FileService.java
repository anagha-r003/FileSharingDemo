package com.fileshare.server.service;

import com.fileshare.server.dto.ResponseStructure;
import com.fileshare.server.entity.User;
import com.fileshare.server.entity.UserFile;
import com.fileshare.server.exception.FileNotFoundException;
import com.fileshare.server.exception.StorageLimitExceededException;
import com.fileshare.server.exception.UnauthorizedAccessException;
import com.fileshare.server.repository.FileRepository;
import com.fileshare.server.repository.UserRepository;
import com.fileshare.server.util.ResponseBuilder;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class FileService {
    private final FileRepository fileRepository;
    private final UserRepository userRepository;

    @Value("${file.upload-dir}")
    private String uploadDir;

    public ResponseEntity<ResponseStructure<String>> uploadFile(
            List<MultipartFile> files) throws IOException {

        log.info("File upload request received");

        User user = getCurrentUser();

        // Fix: default null values
        if (user.getStorageUsed() == null) user.setStorageUsed(0L);
        if (user.getStorageLimit() == null) user.setStorageLimit(1L * 1024 * 1024 * 1024); // 10GB default

        // Pre-check total size before touching disk
        long totalSize = 0;
        for (MultipartFile file : files) {
            totalSize += file.getSize();
        }

        if (user.getStorageUsed() + totalSize > user.getStorageLimit()) {
            throw new StorageLimitExceededException("Storage limit exceeded!");
        }

        File dir = new File(uploadDir);
        if (!dir.exists()) dir.mkdirs();

        for (MultipartFile file : files) {
            String originalName = file.getOriginalFilename();
            String fileName = UUID.randomUUID() + "_" + originalName;
            String path = uploadDir + fileName;
            file.transferTo(new File(path));

            UserFile entity = UserFile.builder()
                    .name(originalName)
                    .size(file.getSize())
                    .path(path)
                    .isDeleted(false)
                    .user(user)
                    .build();
            fileRepository.save(entity);
        }

        user.setStorageUsed(user.getStorageUsed() + totalSize);
        userRepository.save(user);

        return ResponseBuilder.build(
                HttpStatus.OK,
                "Files uploaded successfully",
                null
        );
    }
    public ResponseEntity<ResponseStructure<List<UserFile>>> getUserFiles() {

        log.info("Fetching user files");

        User user = getCurrentUser();

        List<UserFile> files = fileRepository.findByUserIdAndIsDeletedFalse(user.getId());

        return ResponseBuilder.build(
                HttpStatus.OK,
                "Files fetched successfully",
                files
        );
    }

    public ResponseEntity<Resource> downloadFile(Long fileId) throws IOException {

        log.info("Download request for fileId: {}", fileId);

        // Get logged-in user
        User user = getCurrentUser();

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

    public ResponseEntity<ResponseStructure<String>> deleteFile(Long fileId) {

        log.info("Delete request for fileId: {}", fileId);

        // Get logged-in user
        User user = getCurrentUser();

        // Fetch file
        UserFile file = fileRepository.findById(fileId)
                .orElseThrow(() -> new FileNotFoundException("File not found"));

        // Authorization check
        if (!file.getUser().getId().equals(user.getId())) {
            throw new UnauthorizedAccessException("Unauthorized access");
        }

        // Soft delete (move to recycle bin)
        file.setIsDeleted(true);
        fileRepository.save(file);

        return ResponseBuilder.build(
                HttpStatus.OK,
                "File moved to Recycle Bin",
                null
        );
    }

    public ResponseEntity<ResponseStructure<List<UserFile>>> getDeletedFiles() {

        User user = getCurrentUser();

        List<UserFile> files = fileRepository
                .findByUserIdAndIsDeletedTrue(user.getId());

        return ResponseBuilder.build(
                HttpStatus.OK,
                "Deleted files fetched successfully",
                files
        );
    }

    public ResponseEntity<Resource> previewFile(Long id) throws IOException {
        UserFile file = fileRepository.findById(id)
                .orElseThrow(() -> new FileNotFoundException("File not found"));

        Path filePath = Paths.get(file.getPath());
        Resource resource = new UrlResource(filePath.toUri());

        if (!resource.exists() || !resource.isReadable()) {
            throw new RuntimeException("File not found or not readable");
        }

        String contentType = Files.probeContentType(filePath);
        if (contentType == null) contentType = "application/octet-stream";

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .body(resource);
    }


    private User getCurrentUser() {
        return (User) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();
    }
}
