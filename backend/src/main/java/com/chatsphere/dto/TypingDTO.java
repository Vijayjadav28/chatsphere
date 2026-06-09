package com.chatsphere.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TypingDTO {
    private Long senderId;
    private String senderName;
    private Long receiverId;
    private Boolean typing;
}
