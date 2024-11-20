# AI Learning Platform Technical Specification

## Table of Contents
1. Vision and Goals
2. User Personas
3. Workflow Philosophy
4. Technical Architecture
5. Component Use Cases      
6. Data Model
7. Implementation Methodology
8. Access Control
9. Success Metrics
10. Future Considerations
11. Glossary

## 1. Vision and Goals

### Vision Statement
To create an accessible, educational platform that introduces students to the world of Artificial Intelligence through hands-on experience. By providing a guided, practical approach to image processing, annotation, and model training, students can understand core AI concepts while working with real-world tools and workflows.

### Educational Goals
1. Provide hands-on experience with real AI workflows
2. Demonstrate practical applications of theoretical concepts
3. Introduce industry-standard tools and practices
4. Build confidence in working with AI technologies

### Learning Outcomes
1. Understanding of AI model training process
2. Practical experience with data preparation
3. Knowledge of image processing techniques
4. Familiarity with collaborative AI development
5. Experience with model evaluation and iteration

## 2. User Personas

### Computer Science Professor
- **Role**: Senior Faculty Member
- **Goals**: 
  - Create engaging AI learning experiences
  - Demonstrate practical AI applications
  - Monitor student progress and understanding
  - Bridge theory and practice
- **Pain Points**:
  - Complex setup of AI environments
  - Need for accessible teaching tools
  - Difficulty tracking student progress
  - Limited hands-on resources

### Undergraduate Student
- **Role**: Computer Science Student
- **Goals**:
  - Understand AI fundamentals through practice
  - Gain hands-on experience
  - Build confidence with AI tools
  - Create portfolio projects
- **Pain Points**:
  - Steep learning curve
  - Abstract theoretical concepts
  - Limited practical experience
  - Need for guided learning

### Graduate Research Assistant
- **Role**: Research Team Member
- **Goals**:
  - Support student learning
  - Manage practical sessions
  - Assist with project implementation
  - Guide technical implementation
- **Pain Points**:
  - Resource management
  - Student support requirements
  - Project oversight needs
  - Technical troubleshooting

## 3. Workflow Philosophy

### Understanding the AI Pipeline
The platform's workflow is designed to mirror real-world AI development processes while making them accessible to students. This approach follows a logical progression:

1. **Data Preparation & Annotation**
   - Understanding importance of quality training data
   - Manual annotation for feature recognition
   - Hands-on data labeling experience
   - Collaborative annotation workflows

2. **Model Training**
   - Direct connection between annotations and model behavior
   - Real-time training monitoring and logging
   - Immediate feedback through training metrics
   - Understanding model iteration process

3. **Application & Analysis**
   - Practical model application
   - Result interpretation
   - Performance visualization
   - End-to-end pipeline experience

### Workflow Progression
```mermaid
graph TD
    A[Project Creation] --> B[Image Import]
    B --> C[Tiling Process]
    C --> D[Annotation Phase]
    D --> E[Training Set Creation]
    E --> F[Model Training]
    F --> G[Training Monitoring]
    G --> H[Model Evaluation]
    H --> I[Results & Reports]
```

## 4. Technical Architecture

### System Components
```mermaid
graph TB
    Client[Web Browser] --> Caddy[Caddy Server]
    Caddy --> Django[Django Application]
    Django --> DB[(PostgreSQL)]
    Django --> RMQ[RabbitMQ]
    RMQ --> Celery[Celery Workers]
    Celery --> LocalProcess[Local Processing]
    Celery --> RemoteGPU[Remote GPU Training]
    
    subgraph "Main Server"
        Caddy
        Django
        DB
        RMQ
        Celery
        LocalProcess
    end
    
    subgraph "GPU Cluster"
        RemoteGPU
    end
```

### Project Structure
```
projects/
└── project-{id}/
    ├── input_images/
    │   └── raw images
    ├── annotations/
    │   └── django-labeller output
    └── ml/
        └── pipelines/
            └── pipeline-{id}/
                └── trainingjob-{id}/
                    ├── images/      # Training images
                    ├── labels/      # Label data
                    ├── masks/       # Generated masks
                    ├── models/      # Model outputs
                    └── train.log    # Training log
```

### Docker Infrastructure

```yaml
services:
  studio-ai:
    image: studio:0.7
    container_name: studio-ai
    volumes:
      - ./studio.ai:/app
    networks:
      - studio-network
    environment:
      - CELERY_BROKER_URL=amqp://admin:mypass@rabbitmq:5672/
      - CELERY_RESULT_BACKEND=rpc://admin:mypass@rabbitmq:5672/

  caddy:
    image: caddy:2
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy_data:/data
      - caddy_config:/config

  worker:
    build: ./worker
    depends_on:
      - rabbitmq
    environment:
      - CELERY_BROKER_URL=amqp://admin:mypass@rabbitmq:5672/
      - CELERY_RESULT_BACKEND=rpc://admin:mypass@rabbitmq:5672/

  worker-gpu:
    image: axons-train:latest
    volumes:
      - ./axons:/workspace
    environment:
      - CELERY_BROKER_URL=amqp://admin:mypass@rabbitmq:5672/
      - CELERY_RESULT_BACKEND=rpc://admin:mypass@rabbitmq:5672/
```

## 5. Component Use Cases

### Training System
```mermaid
graph TB
    subgraph Training System
        direction TB
        U((User))
        
        U --> A[Initiate Training]
        U --> B[Monitor Progress]
        U --> C[View History]
        U --> D[Manage Models]
        
        A --> A1[Select Dataset]
        A --> A2[Configure Parameters]
        A --> A3[Set Resources]
        
        B --> B1[View Status]
        B --> B2[Check Metrics]
        B --> B3[View Live Logs]
        
        C --> C1[Past Trainings]
        C --> C2[Compare Results]
        C --> C3[Download Logs]
        
        D --> D1[Save Models]
        D --> D2[Delete Models]
        D --> D3[Share Models]
    end
```

### Training Flow
```mermaid
sequenceDiagram
    participant U as User
    participant S as System
    participant G as GPU Server
    participant D as Database
    
    U->>S: Request Training
    S->>D: Check Resources
    S->>G: Initialize Training
    
    loop Training Process
        G->>S: Update Progress
        G->>S: Stream Logs
        S->>U: Show Status
        S->>U: Update Live Log
    end
    
    G->>S: Complete Training
    S->>D: Save Model
    S->>D: Store Final Log
    S->>U: Notify Completion
```

### Training Job States

| State | Description | Data Flow |
|-------|-------------|-----------|
| PENDING | Job created, awaiting start | Config validation |
| STARTED | Initial setup in progress | Data preparation |
| PROCESSING | Training active | Live metrics & logs |
| COMPLETED | Training finished successfully | Model & log storage |
| FAILED | Training encountered error | Error logs & diagnostics |

### Worker Configuration
```yaml
training_worker:
  config_schema:
    batch_size:
      type: integer
      label: "Batch Size"
      default: 8
      help_text: "Number of images to process simultaneously"
    epochs:
      type: integer
      label: "Epochs"
      default: 10
      help_text: "Number of complete passes through the training data"
    model_architecture:
      type: choice
      label: "Model Architecture"
      choices:
        - ["upernet-convnext-base", "UperNet ConvNeXt Base"]
      help_text: "Neural network architecture to use for training"
    learning_rate:
      type: float
      label: "Learning Rate"
      default: 0.001
      help_text: "Step size for model optimization"
```

### Training Metrics Format
```
Epoch [N/Total]: Training Status
- Train Loss: X.XXXX (Model training loss)
- Train IoU: X.XXXX (Intersection over Union)
- Val Loss: X.XXXX (Validation loss)
- Val IoU: X.XXXX (Validation IoU)
```

## 6. Data Model

### Training Pipeline Model
```python
class Pipeline(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    name = models.CharField(max_length=255)
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    worker = models.ForeignKey(Worker, on_delete=models.PROTECT)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
```

### Training Job Model
```python
class TrainingJob(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    pipeline = models.ForeignKey(Pipeline, on_delete=models.CASCADE)
    status = models.CharField(
        max_length=20,
        choices=[
            ('PENDING', 'Pending'),
            ('STARTED', 'Started'),
            ('PROCESSING', 'Processing'),
            ('COMPLETED', 'Completed'),
            ('FAILED', 'Failed'),
        ]
    )
    progress = models.FloatField(default=0.0)
    config = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

## 7. Implementation Guidelines

### Training Job Directory Structure
```
trainingjob-{id}/
├── config.json           # Job configuration
├── metadata.json         # Job metadata
├── images/              # Training images directory
├── labels/              # Label data directory
├── masks/               # Generated masks directory
├── models/              # Model checkpoints and final model
└── train.log            # Training progress log
```

### Log Management
1. Real-time log streaming during training
2. Persistent storage of training logs
3. Log parsing for metrics extraction
4. Log visualization in UI
5. Log file download capability

### Error Handling
1. Training failure detection
2. Error log capture and storage
3. User notification system
4. Recovery procedures
5. Resource cleanup

## 8. Access Control

### Role-Based Permissions Matrix

| Action | Admin | Professor | Assistant | Student |
|--------|-------|-----------|-----------|---------|
| Create Pipeline | ✓ | ✓ | ⨯ | ⨯ |
| Configure Training | ✓ | ✓ | ✓ | ⨯ |
| View Training Progress | ✓ | ✓ | ✓ | ✓ |
| Download Logs | ✓ | ✓ | ✓ | ✓ |
| Delete Training Jobs | ✓ | ✓ | ⨯ | ⨯ |

## 9. Success Metrics

### Training Success Metrics
1. Training completion rate
2. Average training duration
3. Model performance metrics
4. Resource utilization
5. Error frequency

### System Performance Metrics
1. Log processing speed
2. UI responsiveness
3. Storage efficiency
4. Resource optimization

## 10. Future Enhancements

1. Advanced log analysis tools
2. Automated performance optimization
3. Enhanced error recovery
4. Batch training capabilities
5. Comparative training analysis

## 11. Glossary

| Term | Definition |
|------|------------|
| Pipeline | ML workflow configuration |
| Training Job | Single training instance |
| Worker | Training execution service |
| Training Set | Prepared training data |
| Training Log | Process execution record |
