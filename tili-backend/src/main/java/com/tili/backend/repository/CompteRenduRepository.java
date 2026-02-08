package com.tili.backend.repository;

import com.tili.backend.entity.CompteRendu;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CompteRenduRepository extends JpaRepository<CompteRendu, String> {
}
