---
sidebar_position: 5
---
# Studio: Technical Overview

## Docker-Containerized Processing Architecture
The Studio platform leverages Docker technology to create a consistent, reproducible environment for all computational processes, including tiling, training, inference, and analysis. This ensures students experience a reliable AI workflow without technical complexity. Data is seamlessly shared across various stages through carefully managed storage.

## AI Learning Workflow
The AI learning process guides students through clearly defined steps:

```mermaid
flowchart TD
    subgraph "Student Learning Journey"
        direction LR
        A[Upload Raw Images] --> B[Automated Tiling]
        B --> C[Annotation with Django Labeller]
        C --> D[Create Training Sets]
        D --> E[Configure Training Parameters]
        E --> F[Monitor Training Progress]
        F --> G[Evaluate Model Performance]
        G --> H[Deploy on New Images]
        H --> I[Analyze Results]
    end
```

## System Architecture
Studio operates with a user-friendly web interface connected to powerful backend services:

- **Web Browser** communicates with a **Caddy Server**, which manages secure connections.
- **Django Application** orchestrates tasks and manages data using a **PostgreSQL Database**.
- **RabbitMQ** coordinates communication and manages tasks between services.
- **Local Processing** tasks are handled on the main server, while **GPU-intensive tasks** are executed in Docker containers using external GPU resources.

```mermaid
graph TB
    Client[Web Browser] --> Caddy[Caddy Server]
    Caddy --> Django[Django Application]
    Django --> DB[(PostgreSQL Database)]
    Django --> RMQ[RabbitMQ]
    RMQ --> Worker1[Celery Worker]
    RMQ --> Worker2[Dockerized Worker for GPU Tasks]
    Worker1 --> LocalProcessing[Local Processing]
    Worker2 --> DockerLayer[Docker Container Layer]
    DockerLayer --> GPU[OVH AI GPU Resources]

    subgraph "Main Server" 
        Caddy
        Django
        DB
        RMQ
        Worker1
        LocalProcessing
    end

    subgraph "Docker Containerized Services"
        Worker2
        DockerLayer
        GPU
    end
```

## Docker-Based Infrastructure
The platform is structured around Docker containers, each specialized for different tasks:

- **Studio AI Container:** Manages the main Django application.
- **Caddy Container:** Provides secure, fast access to the web interface.
- **RabbitMQ Container:** Facilitates communication between components.
- **Worker Containers:** Perform local and GPU-based tasks (tiling, training, inference, analysis).
- **Shared Volumes:** Store media and project data accessible by all containers.

## GPU Training Workflow
Students configure and launch AI training through an intuitive interface:

```mermaid
sequenceDiagram
    participant Student
    participant Django as Django Platform
    participant Queue as RabbitMQ
    participant Worker as Docker Worker
    participant Docker as Docker Container
    participant GPU as OVH GPU Instance
    participant Storage as Shared Volume

    Student->>Django: Configure & Start Training
    Django->>Storage: Store Training Configuration
    Django->>Queue: Create Training Task
    Queue->>Worker: Pick Up Task
    Worker->>Storage: Mount Media Volume
    Worker->>Docker: Create Training Container

    loop Training Process
        GPU->>GPU: Process Training Batches
        GPU->>Storage: Save Model Checkpoints
        Docker->>Worker: Report Metrics
        Worker->>Django: Update Status
        Django->>Student: Display Real-time Progress
    end

    GPU->>Storage: Save Final Trained Model
    Docker->>Worker: Signal Completion
    Worker->>Django: Update Task Status
    Django->>Storage: Access Trained Model
    Django->>Student: Present Training Results
```

## Dockerized Processing Workflow
Studio uses a clear workflow for data processing:

```mermaid
flowchart TD
    subgraph "Shared Volume Structure"
        direction TB
        MediaVolume["/app/media"]
        ProjectData["/app/media/projects"]
        ImageData["/app/media/projects/project-{id}/input_images"]
        TileData["/app/media/projects/project-{id}/annotations"]
        ModelData["/app/media/projects/project-{id}/models"]
        AnalysisData["/app/media/projects/project-{id}/analysis"]
    end

    subgraph "Tiling Process Container"
        direction TB
        T1[Mount Input Images] --> T2[Process Into Tiles] --> T3[Save Tiles to Volume]
    end

    subgraph "Training Process Container"
        direction TB
        M1[Mount Annotation Data] --> M2[Train on GPU] --> M3[Save Model to Volume]
    end

    subgraph "Inference Process Container"
        direction TB
        I1[Mount Model & Input Images] --> I2[Run Inference] --> I3[Save Results to Volume]
    end

    subgraph "Analysis Process Container"
        direction TB
        A1[Mount Inference Results] --> A2[Process & Analyze] --> A3[Generate Visualizations]
    end

    ImageData --> T1
    T3 --> TileData
    TileData --> M1
    M3 --> ModelData
    ModelData --> I1
    ImageData --> I1
    I3 --> AnalysisData
    AnalysisData --> A1
```

## Conclusion
Studio simplifies complex AI workflows through Docker containerization, enabling students to focus on learning and practical AI development without extensive technical overhead. This design mirrors professional AI environments, ensuring real-world applicability and enhancing educational value.

