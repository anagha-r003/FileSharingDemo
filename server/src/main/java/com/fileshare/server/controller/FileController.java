package com.fileshare.server.controller;

import com.fileshare.server.dto.ResponseStructure;
import com.fileshare.server.dto.response.RecycleBinStatsResponse;
import com.fileshare.server.dto.response.StorageStatsResponse;
import com.fileshare.server.entity.UserFile;
import com.fileshare.server.service.FileService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/files")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class FileController {

    private final FileService fileService;

    @PostMapping("/upload")
    public ResponseEntity<ResponseStructure<String>> uploadFile(
            @RequestParam("files") List<MultipartFile> files
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

    @GetMapping("/{fileId}/preview")
    public ResponseEntity<Resource> preview(@PathVariable Long fileId) throws IOException {
        return fileService.getPreviewThumbnail(fileId);
    }

    @GetMapping("/view/{fileId}")
    public ResponseEntity<Resource> view(@PathVariable Long fileId) throws IOException {
        return fileService.viewFile(fileId);
    }
    @DeleteMapping
    public ResponseEntity<ResponseStructure<String>> deleteFiles(
            @RequestBody List<Long> fileIds
    ) {
        return fileService.deleteFile(fileIds);
    }

    @PutMapping("/restore/{fileId}")
    public ResponseEntity<ResponseStructure<String>> restoreFile(@PathVariable Long fileId) {
        return fileService.restoreFile(fileId);
    }

    @DeleteMapping("/permanent/{fileId}")
    public ResponseEntity<ResponseStructure<String>> permanentlyDeleteFile(@PathVariable Long fileId) {
        return fileService.permanentlyDeleteFile(fileId);
    }

    @PutMapping("/restore-all")
    public ResponseEntity<ResponseStructure<Map<String, Object>>> restoreAllFiles() {
        return fileService.restoreAllFiles();
    }

    @DeleteMapping("/empty-bin")
    public ResponseEntity<ResponseStructure<Map<String, Object>>> emptyRecycleBin() {
        return fileService.emptyRecycleBin();
    }

    @GetMapping("/recycle-bin/stats")
    public ResponseEntity<ResponseStructure<RecycleBinStatsResponse>> getRecycleBinStats() {
        return fileService.getRecycleBinStats();
    }

    @GetMapping("/recycle-bin")
    public ResponseEntity<ResponseStructure<List<UserFile>>> getDeletedFiles() {
        return fileService.getDeletedFiles();
    }

    @PutMapping("/star/{fileId}")
    public ResponseEntity<ResponseStructure<String>> starFile(@PathVariable Long fileId) {
        return fileService.starFile(fileId);
    }

    @PutMapping("/unstar/{fileId}")
    public ResponseEntity<ResponseStructure<String>> unstarFile(@PathVariable Long fileId) {
        return fileService.unstarFile(fileId);
    }

    @GetMapping("/starred")
    public ResponseEntity<ResponseStructure<List<UserFile>>> getStarredFiles() {
        return fileService.getStarredFiles();
    }






}
