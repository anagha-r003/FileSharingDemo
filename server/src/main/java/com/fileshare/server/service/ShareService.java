package com.fileshare.server.service;

import com.fileshare.server.dto.ResponseStructure;
import com.fileshare.server.dto.request.CreateShareLinkRequest;
import com.fileshare.server.dto.response.ShareLinkResponse;
import com.fileshare.server.entity.ShareLink;
import com.fileshare.server.entity.User;
import com.fileshare.server.entity.UserFile;
import com.fileshare.server.exception.FileNotFoundException;
import com.fileshare.server.exception.UnauthorizedAccessException;
import com.fileshare.server.repository.FileRepository;
import com.fileshare.server.repository.ShareLinkRepository;
import com.fileshare.server.util.ResponseBuilder;
import com.fileshare.server.util.SecurityUtil;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ShareService {

    private final ShareLinkRepository shareLinkRepository;
    private final FileRepository fileRepository;
    private final EmailService emailService;

    @Transactional
    public ResponseEntity<ResponseStructure<List<ShareLinkResponse>>>
    createShareLink(CreateShareLinkRequest request) {

        log.info("Share link creation request received");

        User user = SecurityUtil.getCurrentUser();

        UserFile file = getAuthorizedFile(
                request.getFileId(),
                user.getId()
        );

        List<ShareLinkResponse> responseList =
                new ArrayList<>();

        for (String recipientEmail :
                request.getRecipientEmails()) {

            String token =
                    UUID.randomUUID().toString();

            String shareUrl =
                    "http://localhost:5173/public/share/"
                            + token;

            ShareLink shareLink = ShareLink.builder()
                    .token(token)
                    .recipientEmail(recipientEmail)
                    .message(request.getMessage())
                    .expiresAt(request.getExpiresAt())
                    .createdAt(LocalDateTime.now())
                    .accessed(false)
                    .active(true)
                    .file(file)
                    .createdBy(user)
                    .build();

            shareLinkRepository.save(shareLink);

            emailService.sendShareLinkEmail(
                    recipientEmail,
                    user.getFirstName(),
                    shareUrl,
                    request.getMessage()
            );

            responseList.add(
                    ShareLinkResponse.builder()
                            .shareUrl(shareUrl)
                            .recipientEmail(recipientEmail)
                            .fileName(file.getName())
                            .expiresAt(
                                    request.getExpiresAt()
                            )
                            .accessed(false)
                            .build()
            );
        }

        return ResponseBuilder.build(
                HttpStatus.OK,
                "File shared successfully",
                responseList
        );
    }


    public ResponseEntity<ResponseStructure<ShareLinkResponse>>
    resolveShareLink(String token) {

        log.info("Resolving share link: {}", token);

        ShareLink shareLink =
                getValidShareLink(token);

        shareLink.setAccessed(true);

        shareLinkRepository.save(shareLink);

        ShareLinkResponse response =
                ShareLinkResponse.builder()

                        .recipientEmail(
                                shareLink.getRecipientEmail()
                        )

                        .fileName(
                                shareLink.getFile().getName()
                        )

                        .expiresAt(
                                shareLink.getExpiresAt()
                        )

                        .accessed(true)

                        .viewUrl(
                                "http://localhost:8080/share/view/"
                                        + shareLink.getToken()
                        )

                        .downloadUrl(
                                "http://localhost:8080/share/download/"
                                        + shareLink.getToken()
                        )

                        .build();

        return ResponseBuilder.build(
                HttpStatus.OK,
                "Share link accessed successfully",
                response
        );
    }

    public ResponseEntity<Resource>
    downloadSharedFile(String token)
            throws IOException {

        log.info(
                "Downloading shared file with token: {}",
                token
        );

        ShareLink shareLink =
                getValidShareLink(token);

        shareLink.setAccessed(true);

        shareLinkRepository.save(shareLink);

        UserFile file = shareLink.getFile();

        Path path = Paths.get(file.getPath());

        Resource resource =
                new UrlResource(path.toUri());

        if (!resource.exists()) {

            throw new RuntimeException(
                    "File not found"
            );
        }

        String contentType =
                file.getMimeType() != null
                        ? file.getMimeType()
                        : "application/octet-stream";

        return ResponseEntity.ok()
                .contentType(
                        MediaType.parseMediaType(contentType)
                )
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\""
                                + file.getName() + "\""
                )
                .body(resource);
    }

    public ResponseEntity<ResponseStructure<List<ShareLink>>>
    getMySharedFiles() {

        log.info("Fetching shared files");

        User user = SecurityUtil.getCurrentUser();

        List<ShareLink> sharedFiles =
                shareLinkRepository
                        .findByCreatedByIdOrderByCreatedAtDesc(
                                user.getId()
                        );

        return ResponseBuilder.build(
                HttpStatus.OK,
                "Shared files fetched successfully",
                sharedFiles
        );
    }

    @Transactional
    public ResponseEntity<ResponseStructure<String>>
    revokeShareLink(Long shareId) {

        log.info("Revoking share link: {}", shareId);

        User user = SecurityUtil.getCurrentUser();

        ShareLink shareLink =
                shareLinkRepository.findById(shareId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Share link not found"
                                ));

        if (!shareLink.getCreatedBy()
                .getId()
                .equals(user.getId())) {

            throw new UnauthorizedAccessException(
                    "Unauthorized access"
            );
        }

        shareLink.setActive(false);

        shareLinkRepository.save(shareLink);

        return ResponseBuilder.build(
                HttpStatus.OK,
                "Share link revoked successfully",
                null
        );
    }

    public ResponseEntity<Resource>
    viewSharedFile(String token)
            throws IOException {

        log.info("Viewing shared file with token: {}", token);

        ShareLink shareLink =
                getValidShareLink(token);

        shareLink.setAccessed(true);

        shareLinkRepository.save(shareLink);

        UserFile file = shareLink.getFile();

        Path path = Paths.get(file.getPath());

        Resource resource =
                new UrlResource(path.toUri());

        if (!resource.exists()) {

            throw new RuntimeException(
                    "File not found"
            );
        }

        String contentType =
                file.getMimeType() != null
                        ? file.getMimeType()
                        : "application/octet-stream";

        return ResponseEntity.ok()
                .contentType(
                        MediaType.parseMediaType(contentType)
                )
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "inline; filename=\"" +
                                file.getName() + "\""
                )
                .body(resource);
    }

    private UserFile getAuthorizedFile(
            Long fileId,
            Long userId
    ) {

        UserFile file =
                fileRepository.findById(fileId)
                        .orElseThrow(() ->
                                new FileNotFoundException(
                                        "File not found"
                                ));

        if (!file.getUser()
                .getId()
                .equals(userId)) {

            throw new UnauthorizedAccessException(
                    "Unauthorized access to file"
            );
        }

        return file;
    }

    private ShareLink getValidShareLink(
            String token
    ) {

        ShareLink shareLink =
                shareLinkRepository.findByToken(token)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Invalid share link"
                                ));

        if (!shareLink.getActive()) {

            throw new RuntimeException(
                    "Share link is inactive"
            );
        }

        if (shareLink.getExpiresAt()
                .isBefore(LocalDateTime.now())) {

            throw new RuntimeException(
                    "Share link expired"
            );
        }

        return shareLink;
    }




}
