package com.fileshare.server.repository;

import com.fileshare.server.entity.UserFile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FileRepository extends JpaRepository<UserFile,Long> {
    List<UserFile> findByUserId(Long userId);
    long countByUserId(Long userId);
}
