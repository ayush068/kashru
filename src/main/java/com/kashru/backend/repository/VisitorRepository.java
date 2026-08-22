package com.kashru.backend.repository;

import com.kashru.backend.entity.Visitor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.Optional;

public interface VisitorRepository extends JpaRepository<Visitor, Long> {

    Optional<Visitor> findBySessionId(String sessionId);

    long countByLastSeenAfter(LocalDateTime time);

}