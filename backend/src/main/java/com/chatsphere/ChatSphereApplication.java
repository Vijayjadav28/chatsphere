package com.chatsphere;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ChatSphereApplication {
    public static void main(String[] args) {
        SpringApplication.run(ChatSphereApplication.class, args);
        System.out.println("\n==========================================");
        System.out.println("  ChatSphere Backend started on port 8080");
        System.out.println("==========================================\n");
    }
}
