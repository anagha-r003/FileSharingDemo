package com.fileshare.server.controller;

import com.fileshare.server.dto.ResponseStructure;
import com.fileshare.server.entity.UserFolder;
import com.fileshare.server.service.FolderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/folders")
@RequiredArgsConstructor
public class FolderController {

    private final FolderService folderService;

    @PostMapping("/upload")
    public ResponseEntity<ResponseStructure<String>> uploadFolder(
            @RequestParam("files") List<MultipartFile> files,
            @RequestParam("relativePaths") List<String> relativePaths
    ) throws IOException {
        return folderService.uploadFolder(files, relativePaths);
    }

    @GetMapping
    public ResponseEntity<ResponseStructure<List<UserFolder>>> getFolders() {
        return folderService.getFolders();
    }
}
