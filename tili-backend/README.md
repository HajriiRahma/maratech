# TILI – Internal Management Platform Backend

## Overview
This is the Spring Boot backend for the TILI internal management platform. It provides REST APIs for User, Document, Project, and Meeting management.

## Tech Stack
- **Framework**: Spring Boot 3.2.0
- **Database**: MySQL (tili_database)
- **ORM**: Spring Data JPA + Hibernate
- **Build Tool**: Maven

## Architecture
The application follows a standard Layered Architecture:
1. **Controller Layer** (`com.tili.backend.controller`): Handles HTTP requests and returns DTOs.
2. **Service Layer** (`com.tili.backend.service`):/Contains business logic and transaction management.
3. **Repository Layer** (`com.tili.backend.repository`): Interacts with the database using Spring Data JPA.
4. **Entity Layer** (`com.tili.backend.entity`): Represents the database tables.
5. **DTO Layer** (`com.tili.backend.dto`): Data Transfer Objects to decouple API from Database.

## Setup & Run
1. Ensure MySQL is running on port 3306.
2. Ensure database `tili_database` exists (tables should be there as per requirements).
3. Update `src/main/resources/application.properties` if your DB credentials differ.
4. Run the application:
   ```bash
   mvn spring-boot:run
   ```

## API Documentation & Example Requests

### 1. Authentication
**POST** `/api/auth/login`
```json
{
  "email": "consultant@tili.org",
  "password": "password123"
}
```

### 2. User Management
**POST** `/api/users` (Create User)
```json
{
  "name": "Jane Doe",
  "email": "jane@tili.org",
  "password": "securePass",
  "role": "CHEF_PROJET"
}
```

### 3. Project Management
**POST** `/api/projects`
```json
{
  "name": "Hackathon 2026",
  "startDate": "2026-02-01",
  "endDate": "2026-02-28",
  "statut": "ACTIVE"
}
```

### 4. Meeting Management
**POST** `/api/meetings`
```json
{
  "date": "2026-02-10T10:00:00",
  "sujet": "Kickoff Meeting",
  "compteRenduSummary": "Initial discussion",
  "projectId": "UUID-of-Project" 
}
```

### 5. Document Upload
**POST** `/api/documents` (Multipart)
- **file**: [Select File]
- **title**: "Project Spec"
- **type**: "PROJET"
- **userId**: "UUID-of-User"
- **projectId**: "UUID-of-Project" (Optional)

### 6. Dashboard
**GET** `/api/dashboard/stats`
Returns counts of projects, documents, etc.
