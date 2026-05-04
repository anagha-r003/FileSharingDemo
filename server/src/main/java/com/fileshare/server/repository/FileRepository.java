package com.fileshare.server.repository;

import com.fileshare.server.entity.UserFile;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;


import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface FileRepository extends JpaRepository<UserFile,Long> {

    Page<UserFile> findByUserIdAndIsDeletedFalse(Long userId, Pageable pageable);

    List<UserFile> findByUserIdAndIsDeletedTrue(Long userId);

    List<UserFile> findByUserIdAndIsDeletedFalseAndIsStarredTrue(Long userId);

    long countByUserId(Long userId);

    Optional<UserFile> findByIdAndUserId(Long fileId, Long userId);

    Optional<UserFile> findByIdAndUserIdAndIsDeletedTrue(Long fileId, Long userId);

    List<UserFile> findByIsDeletedTrueAndDeletedAtBefore(LocalDateTime time);

    @Query("""
SELECT 
    COALESCE(SUM(f.size), 0),
    COALESCE(SUM(CASE WHEN COALESCE(f.mimeType, '') LIKE 'image%' THEN f.size END), 0),
    COALESCE(SUM(CASE WHEN COALESCE(f.mimeType, '') LIKE 'video%' THEN f.size END), 0),
    COALESCE(SUM(CASE 
        WHEN COALESCE(f.mimeType, '') LIKE '%pdf%' 
          OR COALESCE(f.mimeType, '') LIKE '%word%' 
          OR COALESCE(f.mimeType, '') LIKE '%excel%' 
          OR COALESCE(f.mimeType, '') LIKE '%text%' 
          OR COALESCE(f.mimeType, '') LIKE '%ppt%' 
        THEN f.size END), 0),
    COALESCE(SUM(CASE 
        WHEN COALESCE(f.mimeType, '') NOT LIKE 'image%' 
         AND COALESCE(f.mimeType, '') NOT LIKE 'video%' 
         AND COALESCE(f.mimeType, '') NOT LIKE '%pdf%' 
         AND COALESCE(f.mimeType, '') NOT LIKE '%word%' 
         AND COALESCE(f.mimeType, '') NOT LIKE '%excel%' 
         AND COALESCE(f.mimeType, '') NOT LIKE '%text%' 
         AND COALESCE(f.mimeType, '') NOT LIKE '%ppt%' 
        THEN f.size END), 0)
FROM UserFile f
WHERE f.user.id = :userId AND f.isDeleted = false
""")
    List<Object[]> getStorageStats(Long userId);


}
