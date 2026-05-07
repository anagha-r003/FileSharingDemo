package com.fileshare.server.controller;

import com.fileshare.server.dto.ResponseStructure;
import com.fileshare.server.dto.request.CreateShareLinkRequest;
import com.fileshare.server.dto.response.ShareLinkResponse;
import com.fileshare.server.entity.ShareLink;
import com.fileshare.server.service.ShareService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/share")
@RequiredArgsConstructor
public class ShareController {

    private final ShareService shareService;

    @PostMapping
    public ResponseEntity<
                ResponseStructure<List<ShareLinkResponse>>>
    createShareLink(
            @RequestBody CreateShareLinkRequest request
    ) {

        return shareService.createShareLink(request);
    }

    @GetMapping("/{token}")
    public ResponseEntity<
            ResponseStructure<ShareLinkResponse>>
    resolveShareLink(
            @PathVariable String token
    ) {

        return shareService.resolveShareLink(token);
    }

    @GetMapping("/my-shares")
    public ResponseEntity<
            ResponseStructure<List<ShareLink>>>
    getMySharedFiles() {

        return shareService.getMySharedFiles();
    }

    @PatchMapping("/revoke/{shareId}")
    public ResponseEntity<
            ResponseStructure<String>>
    revokeShareLink(
            @PathVariable Long shareId
    ) {

        return shareService.revokeShareLink(shareId);
    }

    @GetMapping("/view/{token}")
    public ResponseEntity<Resource>
    viewSharedFile(
            @PathVariable String token
    ) throws IOException {

        return shareService.viewSharedFile(token);
    }
}
