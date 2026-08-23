package com.kashru.backend.service;

import com.kashru.backend.entity.Visitor;
import com.kashru.backend.repository.VisitorRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

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

    public long getTodayVisitorCount() {

        LocalDateTime startOfToday =
                LocalDate.now().atStartOfDay();

        return visitorRepository
                .countByCreatedAtAfter(startOfToday);
    }

    public long getTodayPageViews() {

        LocalDateTime startOfToday =
                LocalDate.now().atStartOfDay();

        return visitorRepository
                .countByCreatedAtAfter(startOfToday);
    }

    public long getTotalVisitors() {
        return visitorRepository.count();
    }

    public Map<String, Long> getMostVisitedPages() {

        LocalDateTime startOfToday =
                LocalDate.now().atStartOfDay();

        List<Visitor> visitors =
                visitorRepository
                        .findByCreatedAtAfterOrderByCreatedAtDesc(
                                startOfToday
                        );

        Map<String, Long> pageCounts =
                new LinkedHashMap<>();

        for (Visitor visitor : visitors) {

            String page = visitor.getPageUrl();

            if (page == null || page.isBlank()) {
                page = "/";
            }

            pageCounts.put(
                    page,
                    pageCounts.getOrDefault(page, 0L) + 1
            );
        }

        return pageCounts;
    }
}