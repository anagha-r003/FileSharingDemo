package com.fileshare.server.controller;

import com.fileshare.server.dto.ResponseStructure;
import com.fileshare.server.entity.UserFile;
import com.fileshare.server.service.FileService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/files")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class FileController {

    private final FileService fileService;

    @PostMapping("/upload")
    public ResponseEntity<ResponseStructure<String>> uploadFile(
            @RequestParam("file") List<MultipartFile> files
    ) throws IOException {

        return fileService.uploadFile(files);
    }

    @GetMapping
    public ResponseEntity<ResponseStructure<List<UserFile>>> getFiles() {
        return fileService.getUserFiles();
    }

    @GetMapping("/download/{fileId}")
    public ResponseEntity<Resource> download(@PathVariable Long fileId) throws IOException {
        return fileService.downloadFile(fileId);
    }
}
