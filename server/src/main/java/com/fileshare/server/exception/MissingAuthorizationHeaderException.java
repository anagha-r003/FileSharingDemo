package com.fileshare.server.exception;

public class MissingAuthorizationHeaderException extends RuntimeException{
    public MissingAuthorizationHeaderException(String message) {
        super(message);
    }
}
