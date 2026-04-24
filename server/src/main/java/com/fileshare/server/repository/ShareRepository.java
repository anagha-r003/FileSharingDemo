package com.fileshare.server.repository;

import com.fileshare.server.entity.Share;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;

public interface ShareRepository extends JpaRepository<Share,Long> {

    // Active shares
    long countByUserIdAndExpiryTimeAfter(Long userId, LocalDateTime time);

    // Total accesses
    @Query("SELECT COALESCE(SUM(s.accessCount),0) FROM Share s WHERE s.user.id = :userId")
    long getTotalAccesses(Long userId);

    // Get shares for a file
    List<Share> findByFileId(Long fileId);
}
