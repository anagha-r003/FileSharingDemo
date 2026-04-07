package com.fileshare.server.exception;

public class TokenParsingException extends RuntimeException{
    public TokenParsingException(String message) {
        super(message);
    }
}
