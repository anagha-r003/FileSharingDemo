package com.fileshare.server.controller;

import com.fileshare.server.dto.ResponseStructure;
import com.fileshare.server.dto.request.ShareRequest;
import com.fileshare.server.entity.Share;
import com.fileshare.server.service.ShareService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/files")
@RequiredArgsConstructor
public class ShareController {
    private final ShareService shareService;

    // Create Share Link
    @PostMapping("/{fileId}/share")
    public ResponseEntity<ResponseStructure<Share>> createShareLink(
            @PathVariable Long fileId,
            @RequestBody ShareRequest request) {

        return shareService.createShareLink(fileId, request);
    }

    // Get Share Links
    @GetMapping("/{fileId}/shares")
    public ResponseEntity<ResponseStructure<List<Share>>> getShareLinks(
            @PathVariable Long fileId) {

        return shareService.getShareLinks(fileId);
    }
}
