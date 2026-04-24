package com.fileshare.server.exception;

public class StorageLimitExceededException extends RuntimeException{

    public StorageLimitExceededException(String message) {
        super(message);
    }
}
