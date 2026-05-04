package com.fileshare.server.util;

import com.fileshare.server.entity.User;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public class SecurityUtil {

    public static User getCurrentUser() {
        Authentication authentication = SecurityContextHolder
                .getContext()
                .getAuthentication();

        return (User) authentication.getPrincipal();
    }
}
