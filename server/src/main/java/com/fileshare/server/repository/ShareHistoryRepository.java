package com.fileshare.server.repository;

import com.fileshare.server.entity.ShareHistory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ShareHistoryRepository extends JpaRepository<ShareHistory, Long> {
}
