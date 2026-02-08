package com.tili.backend.service;

import com.tili.backend.dto.ProjectDTO;
import com.tili.backend.entity.Project;
import com.tili.backend.repository.ProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProjectService {

    @Autowired
    private ProjectRepository projectRepository;

    public ProjectDTO createProject(ProjectDTO dto) {
        Project project = new Project();
        project.setName(dto.getTitle());
        project.setStartDate(dto.getStartDate());
        project.setEndDate(dto.getEndDate());

        Project saved = projectRepository.save(project);
        return mapToDTO(saved);
    }

    public List<ProjectDTO> getAllProjects() {
        return projectRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public ProjectDTO getProjectById(String id) {
        return projectRepository.findById(id)
                .map(this::mapToDTO)
                .orElseThrow(() -> new RuntimeException("Project not found"));
    }

    private ProjectDTO mapToDTO(Project project) {
        ProjectDTO dto = new ProjectDTO();
        dto.setId(project.getId());
        dto.setTitle(project.getName());
        dto.setStatus(project.getStatut() != null ? project.getStatut().name() : "Planning");
        dto.setTeam(java.util.List.of("Alice", "Bob")); // Mock team
        dto.setDeadline(project.getEndDate() != null ? project.getEndDate().toString() : "TBD");
        dto.setStartDate(project.getStartDate());
        dto.setEndDate(project.getEndDate());
        return dto;
    }

    public Project getProjectEntity(String id) {
        return projectRepository.findById(id).orElse(null);
    }
}
