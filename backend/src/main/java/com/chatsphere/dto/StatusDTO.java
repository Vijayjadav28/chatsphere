package com.chatsphere.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StatusDTO {
    private Long userId;
    private String status;   // ONLINE | OFFLINE
    private String userName;
}
