package com.fileshare.server.service;

import com.fileshare.server.dto.ResponseStructure;
import com.fileshare.server.entity.User;
import com.fileshare.server.entity.UserFile;
import com.fileshare.server.entity.UserFolder;
import com.fileshare.server.exception.StorageLimitExceededException;
import com.fileshare.server.repository.FileRepository;
import com.fileshare.server.repository.UserFolderRepository;
import com.fileshare.server.repository.UserRepository;
import com.fileshare.server.util.ResponseBuilder;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class FolderService {

    private final UserFolderRepository folderRepository;
    private final FileRepository fileRepository;
    private final UserRepository userRepository;

    @Value("${file.upload-dir}")
    private String uploadDir;

    public ResponseEntity<ResponseStructure<String>> uploadFolder(
            List<MultipartFile> files,
            List<String> relativePaths) throws IOException {

        log.info("Folder upload request received: {} file(s)", files.size());

        User user = (User) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();

        if (user.getStorageUsed() == null) user.setStorageUsed(0L);
        if (user.getStorageLimit() == null) user.setStorageLimit(10L * 1024 * 1024 * 1024);

        // Pre-check total size before touching disk
        long totalSize = 0;
        for (MultipartFile file : files) {
            totalSize += file.getSize();
        }

        if (user.getStorageUsed() + totalSize > user.getStorageLimit()) {
            throw new StorageLimitExceededException("Storage limit exceeded!");
        }

        for (int i = 0; i < files.size(); i++) {
            MultipartFile file = files.get(i);

            String relativePath = (relativePaths != null && i < relativePaths.size())
                    ? relativePaths.get(i) : "";

            // Sanitize: prevent path traversal
            relativePath = relativePath
                    .replaceAll("\\.\\.", "")
                    .replaceAll("^/+", "")
                    .replaceAll("//+", "/");

            // "Sample_folder/sub/image.jpeg" → "Sample_folder/sub"
            String subDir = relativePath.contains("/")
                    ? relativePath.substring(0, relativePath.lastIndexOf('/'))
                    : "";

            // Create directories on disk
            Path targetDir = Paths.get(uploadDir).resolve(subDir);
            Files.createDirectories(targetDir);

            // Create or fetch folder record in DB
            UserFolder folder = null;
            if (!subDir.isBlank()) {
                folder = getOrCreateFolder(subDir, targetDir.toString(), user);
            }

            // Strip path prefix from filename if browser sends full relative path
            String originalName = file.getOriginalFilename();
            if (originalName != null && originalName.contains("/")) {
                originalName = originalName.substring(originalName.lastIndexOf('/') + 1);
            }

            // Save file to disk
            String fileName = UUID.randomUUID() + "_" + originalName;
            Path targetPath = targetDir.resolve(fileName);
            file.transferTo(targetPath.toFile());

            // Save file record to DB
            UserFile entity = UserFile.builder()
                    .name(originalName)
                    .size(file.getSize())
                    .path(targetPath.toString())
                    .relativePath(relativePath.isBlank() ? null : relativePath)
                    .folder(folder)
                    .user(user)
                    .build();
            fileRepository.save(entity);
        }

        user.setStorageUsed(user.getStorageUsed() + totalSize);
        userRepository.save(user);

        return ResponseBuilder.build(
                HttpStatus.OK,
                "Folder uploaded successfully",
                null
        );
    }

    public ResponseEntity<ResponseStructure<List<UserFolder>>> getFolders() {
        User user = (User) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();

        List<UserFolder> folders = folderRepository.findByUser(user);

        return ResponseBuilder.build(
                HttpStatus.OK,
                "Folders fetched successfully",
                folders
        );
    }

    // Reusable helper — finds existing folder record or creates a new one
    private UserFolder getOrCreateFolder(String subDir, String diskPath, User user) {
        return folderRepository
                .findByPathAndUser(diskPath, user)
                .orElseGet(() -> {
                    // Get just the leaf folder name
                    // "Sample_folder/sub" → "sub"
                    String folderName = subDir.contains("/")
                            ? subDir.substring(subDir.lastIndexOf('/') + 1)
                            : subDir;

                    // Find parent folder if nested
                    UserFolder parent = null;
                    if (subDir.contains("/")) {
                        String parentSubDir = subDir.substring(0, subDir.lastIndexOf('/'));
                        Path parentDiskPath = Paths.get(uploadDir).resolve(parentSubDir);
                        parent = folderRepository
                                .findByPathAndUser(parentDiskPath.toString(), user)
                                .orElse(null);
                    }

                    return folderRepository.save(
                            UserFolder.builder()
                                    .name(folderName)
                                    .path(diskPath)
                                    .relativePath(subDir)
                                    .parent(parent)
                                    .user(user)
                                    .createdAt(LocalDateTime.now())
                                    .build()
                    );
                });
    }
}
