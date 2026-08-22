package com.kashru.backend.controller;

import com.kashru.backend.entity.Visitor;
import com.kashru.backend.service.VisitorService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

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

    // Live visitors
    @GetMapping("/live")
    public ResponseEntity<Long> getLiveVisitors() {

        return ResponseEntity.ok(
                visitorService.getLiveVisitorCount()
        );
    }

    // Today's visitors
    @GetMapping("/today")
    public ResponseEntity<Long> getTodayVisitors() {

        return ResponseEntity.ok(
                visitorService.getTodayVisitorCount()
        );
    }

    // Today's page views
    @GetMapping("/today/pageviews")
    public ResponseEntity<Long> getTodayPageViews() {

        return ResponseEntity.ok(
                visitorService.getTodayPageViews()
        );
    }

    // Total visitors
    @GetMapping("/total")
    public ResponseEntity<Long> getTotalVisitors() {

        return ResponseEntity.ok(
                visitorService.getTotalVisitors()
        );
    }

    // Most visited pages
    @GetMapping("/most-visited")
    public ResponseEntity<Map<String, Long>> getMostVisitedPages() {

        return ResponseEntity.ok(
                visitorService.getMostVisitedPages()
        );
    }
}