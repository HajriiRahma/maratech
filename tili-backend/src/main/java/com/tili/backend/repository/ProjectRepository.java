package com.tili.backend.repository;

import com.tili.backend.entity.Project;
import com.tili.backend.enums.ProjectStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, String> {
    long countByStatut(ProjectStatus statut);

    List<Project> findByStatut(ProjectStatus statut);
}
