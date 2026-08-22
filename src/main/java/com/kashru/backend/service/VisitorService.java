package com.kashru.backend.service;

import com.kashru.backend.entity.Visitor;
import com.kashru.backend.repository.VisitorRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class VisitorService {

    private final VisitorRepository visitorRepository;

    public VisitorService(VisitorRepository visitorRepository) {
        this.visitorRepository = visitorRepository;
    }

    public Visitor trackVisitor(
            String sessionId,
            String pageUrl,
            String pageTitle,
            String device,
            String browser) {

        Visitor visitor = visitorRepository
                .findBySessionId(sessionId)
                .orElseGet(Visitor::new);

        visitor.setSessionId(sessionId);
        visitor.setPageUrl(pageUrl);
        visitor.setPageTitle(pageTitle);
        visitor.setDevice(device);
        visitor.setBrowser(browser);
        visitor.setLastSeen(LocalDateTime.now());

        return visitorRepository.save(visitor);
    }

    public long getLiveVisitorCount() {

        LocalDateTime activeSince =
                LocalDateTime.now().minusMinutes(5);

        return visitorRepository
                .countByLastSeenAfter(activeSince);
    }
}