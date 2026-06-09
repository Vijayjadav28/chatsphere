package com.chatsphere.dto;

import com.chatsphere.model.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {

    private Long id;
    private String name;
    private String email;
    private String status;
    private LocalDateTime lastSeen;
    private String avatar;

    public static UserDTO from(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .status(user.getStatus().name())
                .lastSeen(user.getLastSeen())
                .avatar(user.getAvatar())
                .build();
    }
}
