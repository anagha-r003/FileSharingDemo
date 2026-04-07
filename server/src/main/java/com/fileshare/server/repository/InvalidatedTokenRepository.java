package com.fileshare.server.repository;

import com.fileshare.server.entity.InvalidatedToken;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InvalidatedTokenRepository extends JpaRepository<InvalidatedToken,Long> {
    boolean existsByToken(String token);
}
