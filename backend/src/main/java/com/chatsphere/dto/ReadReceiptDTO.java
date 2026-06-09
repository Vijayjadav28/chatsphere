package com.chatsphere.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReadReceiptDTO {
    private Long senderId;   // original message sender
    private Long receiverId; // person who read the messages
    private List<Long> messageIds;
}
