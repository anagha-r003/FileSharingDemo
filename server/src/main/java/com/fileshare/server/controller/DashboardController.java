package com.fileshare.server.controller;

import com.fileshare.server.dto.response.DashboardStats;
import com.fileshare.server.entity.User;
import com.fileshare.server.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/stats")
    public DashboardStats getStats(Authentication authentication) {
        User user = (User) authentication.getPrincipal(); // get logged user

        return dashboardService.getStats(user.getId());
    }
}
