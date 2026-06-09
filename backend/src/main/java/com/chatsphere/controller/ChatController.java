package com.chatsphere.controller;

import com.chatsphere.dto.*;
import com.chatsphere.model.User;
import com.chatsphere.service.MessageService;
import com.chatsphere.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequiredArgsConstructor
@Slf4j
public class ChatController {

    private final MessageService messageService;
    private final UserService userService;
    private final SimpMessagingTemplate messagingTemplate;

    // ─── REST: Chat History ──────────────────────────────────────────────────

    @GetMapping("/api/messages/{contactId}")
    public ResponseEntity<List<MessageDTO>> getConversation(
            @PathVariable Long contactId,
            @AuthenticationPrincipal UserDetails userDetails) {
        UserDTO me = userService.getCurrentUser(userDetails.getUsername());
        List<MessageDTO> messages = messageService.getConversation(me.getId(), contactId);
        // Mark messages from contact as read since we're viewing the conversation
        messageService.markAsRead(contactId, me.getId());
        return ResponseEntity.ok(messages);
    }

    // ─── WebSocket: Send Message ─────────────────────────────────────────────

    /**
     * Client sends to /app/chat
     * Server routes to:
     *   - /user/{receiverEmail}/queue/messages  (receiver gets the message)
     *   - /user/{senderEmail}/queue/messages    (sender echo for multi-device)
     */
    @MessageMapping("/chat")
    public void sendMessage(@Payload SendMessageRequest request, Principal principal) {
        UserDTO sender = userService.getCurrentUser(principal.getName());
        MessageDTO saved = messageService.saveMessage(sender.getId(), request);

        // Get receiver email for STOMP routing (principal name = email)
        UserDTO receiver = userService.getUserById(request.getReceiverId());

        // Send to receiver's private queue
        messagingTemplate.convertAndSendToUser(
                receiver.getEmail(),
                "/queue/messages",
                saved
        );

        // Echo back to sender (for multi-tab / multi-device support)
        messagingTemplate.convertAndSendToUser(
                principal.getName(),
                "/queue/messages",
                saved
        );

        log.debug("Message from {} to {}: {}", sender.getName(), receiver.getName(), saved.getContent());
    }

    // ─── WebSocket: Typing Indicator ─────────────────────────────────────────

    /**
     * Client sends to /app/typing with {receiverId, typing: true/false}
     * Server routes to /user/{receiverEmail}/queue/typing
     */
    @MessageMapping("/typing")
    public void typingIndicator(@Payload TypingDTO typing, Principal principal) {
        UserDTO sender = userService.getCurrentUser(principal.getName());
        UserDTO receiver = userService.getUserById(typing.getReceiverId());

        typing.setSenderId(sender.getId());
        typing.setSenderName(sender.getName());

        messagingTemplate.convertAndSendToUser(
                receiver.getEmail(),
                "/queue/typing",
                typing
        );
    }

    // ─── WebSocket: Read Receipt ─────────────────────────────────────────────

    /**
     * Client sends to /app/read with {senderId, messageIds}
     * Server marks messages as read and notifies the original sender
     */
    @MessageMapping("/read")
    public void readReceipt(@Payload ReadReceiptDTO receipt, Principal principal) {
        UserDTO reader = userService.getCurrentUser(principal.getName());
        receipt.setReceiverId(reader.getId());

        // Mark messages as read in DB
        messageService.markAsRead(receipt.getSenderId(), reader.getId());

        // Notify the original sender their messages were seen
        UserDTO originalSender = userService.getUserById(receipt.getSenderId());
        messagingTemplate.convertAndSendToUser(
                originalSender.getEmail(),
                "/queue/read",
                receipt
        );
    }
}
