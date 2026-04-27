package com.fileshare.server.service;

import com.fileshare.server.dto.ResponseStructure;
import com.fileshare.server.dto.request.ShareRequest;
import com.fileshare.server.entity.Share;
import com.fileshare.server.entity.User;
import com.fileshare.server.entity.UserFile;
import com.fileshare.server.repository.FileRepository;
import com.fileshare.server.repository.ShareRepository;
import com.fileshare.server.util.ResponseBuilder;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ShareService {

    private final ShareRepository shareRepository;
    private final FileRepository fileRepository;

    // Create Share Link
    public ResponseEntity<ResponseStructure<Share>> createShareLink(Long fileId, ShareRequest request) {

        log.info("Creating share link for fileId: {}", fileId);

        // Get logged-in user
        User user = (User) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();

        // Get file
        UserFile file = fileRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("File not found"));

        // Ownership check
        if (!file.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("Unauthorized");
        }

        // Create share object
        Share share = Share.builder()
                .file(file)
                .user(user)
                .sharedWithEmail(request.getSharedWithEmail())
                .publicAccess(request.isPublicAccess())
                .expiryTime(request.getExpiryTime())
                .accessCount(0)
                .build();

        shareRepository.save(share);

        return ResponseBuilder.build(
                HttpStatus.OK,
                "Share link created successfully",
                share
        );
    }

    // Get Share Links
    public ResponseEntity<ResponseStructure<List<Share>>> getShareLinks(Long fileId) {

        log.info("Fetching share links for fileId: {}", fileId);

        // Get logged-in user
        User user = (User) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();

        // Get file
        UserFile file = fileRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("File not found"));

        // Ownership check
        if (!file.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("Unauthorized");
        }

        List<Share> shares = shareRepository.findByFileId(fileId);

        return ResponseBuilder.build(
                HttpStatus.OK,
                "Share links fetched successfully",
                shares
        );
    }
}
