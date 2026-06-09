package com.chatsphere.dto;

import com.chatsphere.model.Message;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageDTO {

    private Long id;
    private Long senderId;
    private String senderName;
    private Long receiverId;
    private String content;
    private String type;
    private Boolean isRead;
    private LocalDateTime timestamp;

    public static MessageDTO from(Message message) {
        return MessageDTO.builder()
                .id(message.getId())
                .senderId(message.getSender().getId())
                .senderName(message.getSender().getName())
                .receiverId(message.getReceiver().getId())
                .content(message.getContent())
                .type(message.getType().name())
                .isRead(message.getIsRead())
                .timestamp(message.getTimestamp())
                .build();
    }
}
