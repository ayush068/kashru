package com.kashru.backend.controller;

import com.kashru.backend.entity.Admin;
import com.kashru.backend.service.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @PostMapping("/create")
    public ResponseEntity<Admin> createAdmin(
            @RequestParam String name,
            @RequestParam String email,
            @RequestParam String password) {

        return ResponseEntity.ok(
                adminService.createAdmin(name, email, password)
        );
    }

    @PostMapping("/login")
    public ResponseEntity<Admin> login(
            @RequestParam String email,
            @RequestParam String password) {

        return ResponseEntity.ok(
                adminService.login(email, password)
        );
    }
}