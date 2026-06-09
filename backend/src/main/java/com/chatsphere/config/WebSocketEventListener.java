package com.chatsphere.config;

import com.chatsphere.dto.StatusDTO;
import com.chatsphere.dto.UserDTO;
import com.chatsphere.model.User;
import com.chatsphere.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.security.Principal;

@Component
@RequiredArgsConstructor
@Slf4j
public class WebSocketEventListener {

    private final UserService userService;
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Fires when a STOMP session is fully established.
     * Updates user status to ONLINE and broadcasts to all clients.
     */
    @EventListener
    public void handleWebSocketConnect(SessionConnectedEvent event) {
        StompHeaderAccessor sha = StompHeaderAccessor.wrap(event.getMessage());
        Principal principal = sha.getUser();
        if (principal != null) {
            String email = principal.getName();
            try {
                userService.updateStatus(email, User.UserStatus.ONLINE);
                UserDTO user = userService.getCurrentUser(email);
                StatusDTO status = new StatusDTO(user.getId(), "ONLINE", user.getName());
                messagingTemplate.convertAndSend("/topic/status", status);
                log.info("User ONLINE: {}", email);
            } catch (Exception e) {
                log.warn("Error handling connect for {}: {}", email, e.getMessage());
            }
        }
    }

    /**
     * Fires when a STOMP session disconnects.
     * Updates user status to OFFLINE and broadcasts last-seen time.
     */
    @EventListener
    public void handleWebSocketDisconnect(SessionDisconnectEvent event) {
        StompHeaderAccessor sha = StompHeaderAccessor.wrap(event.getMessage());
        Principal principal = sha.getUser();
        if (principal != null) {
            String email = principal.getName();
            try {
                userService.updateStatus(email, User.UserStatus.OFFLINE);
                UserDTO user = userService.getCurrentUser(email);
                StatusDTO status = new StatusDTO(user.getId(), "OFFLINE", user.getName());
                messagingTemplate.convertAndSend("/topic/status", status);
                log.info("User OFFLINE: {}", email);
            } catch (Exception e) {
                log.warn("Error handling disconnect for {}: {}", email, e.getMessage());
            }
        }
    }
}
