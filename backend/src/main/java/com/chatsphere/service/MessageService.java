package com.chatsphere.service;

import com.chatsphere.dto.MessageDTO;
import com.chatsphere.dto.SendMessageRequest;
import com.chatsphere.model.Message;
import com.chatsphere.model.User;
import com.chatsphere.repository.MessageRepository;
import com.chatsphere.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;

    @Transactional
    public MessageDTO saveMessage(Long senderId, SendMessageRequest request) {
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("Sender not found: " + senderId));
        User receiver = userRepository.findById(request.getReceiverId())
                .orElseThrow(() -> new RuntimeException("Receiver not found: " + request.getReceiverId()));

        Message.MessageType type = Message.MessageType.TEXT;
        if (request.getType() != null) {
            try {
                type = Message.MessageType.valueOf(request.getType().toUpperCase());
            } catch (IllegalArgumentException ignored) {
                // fall back to TEXT
            }
        }

        Message message = Message.builder()
                .sender(sender)
                .receiver(receiver)
                .content(request.getContent())
                .type(type)
                .isRead(false)
                .build();

        return MessageDTO.from(messageRepository.save(message));
    }

    @Transactional(readOnly = true)
    public List<MessageDTO> getConversation(Long userId1, Long userId2) {
        return messageRepository.findConversation(userId1, userId2).stream()
                .map(MessageDTO::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public void markAsRead(Long senderId, Long receiverId) {
        messageRepository.markMessagesAsRead(senderId, receiverId);
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(Long senderId, Long receiverId) {
        return messageRepository.countUnreadMessages(senderId, receiverId);
    }
}
