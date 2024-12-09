# AI Learning Platform: GPU Processing Architecture & Implementation

## Overview

The AI Learning Platform is an educational system that provides students with practical AI experience through both web-based and local development options. The platform delegates GPU-intensive computations to specialized workers, which are implemented using on-demand GPU resources. This document outlines the current implementation and GPU workflow requirements for Azure integration.

## System Architecture

The platform separates processing into two distinct worker types:

```mermaid
graph TB
    subgraph "Main Application"
        Django[Django Application]
        Queue[RabbitMQ]
    end

    subgraph "Workers"
        CPU[CPU Workers<br/>Image Tiling<br/>Data Preparation]
        GPU[GPU Workers<br/>Training<br/>Inference]
    end

    subgraph "Storage"
        Local[Local Storage]
        Cloud[Cloud Storage]
    end

    Django --> Queue
    Queue --> CPU
    Queue --> GPU
    CPU --> Local
    GPU --> Cloud

    style GPU fill:#f9f,stroke:#333,stroke-width:2px
    style Cloud fill:#f9f,stroke:#333,stroke-width:2px
```

## GPU Workers Implementation

Two specialized GPU workers handle computationally intensive tasks:

### Training Worker
Purpose: Model training using annotated datasets
Current Configuration:
- Docker image: axons-train:latest
- GPU Requirements: NVIDIA T4 or better
- Memory: 16GB GPU RAM minimum
- Storage: Mounted cloud volume

### Inference Worker
Purpose: Image segmentation and analysis
Current Configuration:
- Docker image: axons-train:latest (different entrypoint)
- GPU Requirements: NVIDIA T4 or better
- Memory: 8GB GPU RAM minimum
- Storage: Mounted cloud volume

## Training Process Workflow

```mermaid
sequenceDiagram
    participant User as Web Interface
    participant App as Django App
    participant Queue as RabbitMQ
    participant Storage as Cloud Storage
    participant GPU as GPU VM

    User->>App: Create Training Job
    Note over App: Convert annotations to masks
    
    App->>Storage: 1. Upload Training Data
    Note over Storage: Data prepared for GPU
    
    App->>Queue: 2. Submit Training Task
    Queue->>GPU: 3. Launch GPU Worker
    
    Note over GPU: Initialize Environment
    GPU->>Storage: 4. Mount Storage Volume
    
    loop Training Process
        GPU->>GPU: Process Batch
        GPU->>Storage: Save Checkpoints
        GPU->>App: Update Progress
    end
    
    GPU->>Storage: 5. Save Model Artifact
    Note over Storage: SafeTensor format
    
    App->>Storage: 6. Retrieve Model
    App->>App: 7. Cache Model Locally
    App->>Storage: 8. Cleanup Training Data
```

## Inference Process Workflow

```mermaid
sequenceDiagram
    participant User as Web Interface
    participant App as Django App
    participant Queue as RabbitMQ
    participant Storage as Cloud Storage
    participant GPU as GPU VM

    User->>App: Upload Image & Select Model
    Note over App: Configure Resolution
    
    App->>Storage: 1. Upload Image
    App->>Queue: 2. Submit Inference Task
    Queue->>GPU: 3. Launch GPU Worker
    
    GPU->>Storage: 4. Mount Volume
    GPU->>GPU: 5. Run Segmentation
    GPU->>Storage: 6. Save Results
    
    App->>Storage: 7. Retrieve Results
    App->>Storage: 8. Cleanup Resources
```

## Implementation Details

### Data Flow

```mermaid
graph TD
    A[Input Data] --> B[Cloud Storage]
    B --> C[GPU Processing]
    C --> D[Results Storage]
    D --> E[Result Retrieval]
    E --> F[Local Cache]
    
    subgraph "Cloud Environment"
        B
        C
        D
    end
    
    subgraph "Local Environment"
        A
        E
        F
    end

    style C fill:#f9f,stroke:#333,stroke-width:2px
```

### GPU Worker Lifecycle

The workers follow a specific lifecycle to ensure efficient resource usage:

1. **Initialization**
   - Worker container starts
   - GPU availability check
   - Storage volume mounting
   - Environment preparation

2. **Processing**
   - Data loading from mounted volume
   - GPU computation execution
   - Progress tracking
   - Result saving

3. **Cleanup**
   - Result verification
   - Data transfer completion
   - Resource release
   - Volume unmounting

### Current Resource Requirements

Training Worker:
```json
{
    "gpu_type": "NVIDIA T4",
    "gpu_memory": "16GB",
    "system_memory": "32GB",
    "storage": "100GB minimum",
    "network": "10Gbps"
}
```

Inference Worker:
```json
{
    "gpu_type": "NVIDIA T4",
    "gpu_memory": "8GB",
    "system_memory": "16GB",
    "storage": "50GB minimum",
    "network": "10Gbps"
}
```

## Storage Integration

The platform implements a tiered storage approach:

```mermaid
graph TB
    A[Storage Types] --> B[Local Storage]
    A --> C[Cloud Storage]
    
    B --> B1[Cached Models]
    B --> B2[Processed Results]
    
    C --> C1[Training Data]
    C --> C2[Temporary Results]
    
    style C fill:#f9f,stroke:#333,stroke-width:2px
    style C1 fill:#f9f,stroke:#333,stroke-width:2px
    style C2 fill:#f9f,stroke:#333,stroke-width:2px
```

### Storage Workflow

1. **Data Upload**
   - Validation
   - Conversion if needed
   - Cloud storage transfer

2. **Processing Storage**
   - Volume mounting
   - Temporary workspace
   - Checkpoint saving

3. **Result Management**
   - Result validation
   - Local transfer
   - Cloud cleanup

## Integration Requirements for Azure

### Required Services
- Azure Kubernetes Service (AKS) with GPU nodes
- Azure Storage Account
- Azure Container Registry

### Network Requirements
- Outbound access to storage
- Internal network for worker communication
- Secure communication with main application

### Security Requirements
- RBAC for resource access
- Storage encryption
- Network isolation
- Secure credential management
