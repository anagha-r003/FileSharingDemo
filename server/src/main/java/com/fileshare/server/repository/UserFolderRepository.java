package com.fileshare.server.repository;

import com.fileshare.server.entity.User;
import com.fileshare.server.entity.UserFolder;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserFolderRepository extends JpaRepository<UserFolder, String> {
    List<UserFolder> findByUser(User user);
    Optional<UserFolder> findByPathAndUser(String path, User user);
}
