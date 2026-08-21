package com.kashru.backend.service;

import com.kashru.backend.entity.Admin;
import com.kashru.backend.repository.AdminRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AdminService {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminService(
            AdminRepository adminRepository,
            PasswordEncoder passwordEncoder) {

        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public Admin createAdmin(String name, String email, String password) {

        Admin admin = new Admin();

        admin.setName(name);
        admin.setEmail(email);
        admin.setPassword(passwordEncoder.encode(password));
        admin.setActive(true);

        return adminRepository.save(admin);
    }

    public Admin login(String email, String password) {

        Admin admin = adminRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("Invalid email or password"));

        if (!admin.getActive()) {
            throw new RuntimeException("Admin account is inactive");
        }

        if (!passwordEncoder.matches(password, admin.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        return admin;
    }
}