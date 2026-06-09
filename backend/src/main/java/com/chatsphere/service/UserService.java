package com.chatsphere.service;

import com.chatsphere.dto.UserDTO;
import com.chatsphere.model.User;
import com.chatsphere.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public List<UserDTO> getAllUsers(String currentEmail) {
        return userRepository.findAll().stream()
                .filter(u -> !u.getEmail().equals(currentEmail))
                .map(UserDTO::from)
                .collect(Collectors.toList());
    }

    public List<UserDTO> searchUsers(String query, String currentEmail) {
        return userRepository.searchUsers(query).stream()
                .filter(u -> !u.getEmail().equals(currentEmail))
                .map(UserDTO::from)
                .collect(Collectors.toList());
    }

    public UserDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        return UserDTO.from(user);
    }

    public UserDTO getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));
        return UserDTO.from(user);
    }

    @Transactional
    public void updateStatus(String email, User.UserStatus newStatus) {
        userRepository.findByEmail(email).ifPresent(user -> {
            user.setStatus(newStatus);
            if (newStatus == User.UserStatus.OFFLINE) {
                user.setLastSeen(LocalDateTime.now());
            }
            userRepository.save(user);
        });
    }
}
