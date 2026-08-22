package com.kashru.backend.controller;

import com.kashru.backend.entity.Visitor;
import com.kashru.backend.service.VisitorService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/visitors")
@CrossOrigin(origins = "*")
public class VisitorController {

    private final VisitorService visitorService;

    public VisitorController(VisitorService visitorService) {
        this.visitorService = visitorService;
    }

    // Track / update visitor
    @PostMapping("/track")
    public ResponseEntity<Visitor> trackVisitor(
            @RequestParam String sessionId,
            @RequestParam(required = false) String pageUrl,
            @RequestParam(required = false) String pageTitle,
            @RequestParam(required = false) String device,
            @RequestParam(required = false) String browser) {

        return ResponseEntity.ok(
                visitorService.trackVisitor(
                        sessionId,
                        pageUrl,
                        pageTitle,
                        device,
                        browser
                )
        );
    }

    // Get currently active visitors
    @GetMapping("/live")
    public ResponseEntity<Long> getLiveVisitors() {

        return ResponseEntity.ok(
                visitorService.getLiveVisitorCount()
        );
    }
}