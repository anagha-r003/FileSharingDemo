package com.fileshare.server.service;

import com.fileshare.server.dto.ResponseStructure;
import com.fileshare.server.entity.User;
import com.fileshare.server.entity.UserFile;
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
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class FileService {
    private final FileRepository fileRepository;
    private final UserRepository userRepository;

    @Value("${file.upload-dir}")
    private String uploadDir;

    public ResponseEntity<ResponseStructure<String>> uploadFile(List<MultipartFile> files) throws IOException {
        log.info("File upload request received");
        User user = (User) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();

        // ← Fix: default null values to 0
        if (user.getStorageUsed() == null) user.setStorageUsed(0L);
        if (user.getStorageLimit() == null) user.setStorageLimit(10L * 1024 * 1024 * 1024); // 10GB default

        File dir = new File(uploadDir);
        if (!dir.exists()) dir.mkdirs();

        long totalSize = 0;
        for (MultipartFile file : files) {
            totalSize += file.getSize();
        }

        if (user.getStorageUsed() + totalSize > user.getStorageLimit()) {
            throw new StorageLimitExceededException("Storage limit exceeded!");
        }

        for (MultipartFile file : files) {
            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            String path = uploadDir + fileName;
            file.transferTo(new File(path));
            UserFile entity = UserFile.builder()
                    .name(file.getOriginalFilename())
                    .size(file.getSize())
                    .path(path)
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

        User user = (User) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();

        List<UserFile> files = fileRepository.findByUserId(user.getId());

        return ResponseBuilder.build(
                HttpStatus.OK,
                "Files fetched successfully",
                files
        );
    }

    public ResponseEntity<Resource> downloadFile(Long fileId) throws IOException {

        log.info("Download request for fileId: {}", fileId);

        // Get logged-in user
        User user = (User) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();

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
}
