package com.fileshare.server.repository;

import com.fileshare.server.entity.ShareLink;
import com.fileshare.server.entity.UserFile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ShareLinkRepository extends JpaRepository<ShareLink, Long> {
    Optional<ShareLink> findByToken(String token);

    List<ShareLink> findByFile(UserFile file);

    List<ShareLink> findByCreatedByIdOrderByCreatedAtDesc(
            Long userId
    );

    long countByCreatedById(Long userId);

    long countByCreatedByIdAndExpiresAtAfter(
            Long userId,
            LocalDateTime now
    );

}
