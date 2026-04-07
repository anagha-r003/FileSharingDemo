package com.fileshare.server.exception;

public class BlackListedTokenException extends RuntimeException{
    public BlackListedTokenException(String message) {
        super(message);
    }
}
