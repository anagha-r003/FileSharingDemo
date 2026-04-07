package com.fileshare.server.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ResponseStructure<T>{
    private T data;
    private int status;
    private String message;

}
