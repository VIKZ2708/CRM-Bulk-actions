CRM Bulk Action Platform 
Project Overview
This CRM Bulk Action Platform is designed to perform scalable and efficient bulk operations on CRM entities like contacts. It supports scheduled and immediate bulk updates using modern technologies and patterns like:
Node.js + TypeScript for the backend
Sequelize + PostgreSQL for data persistence
BullMQ for job queueing and batch processing
Google Cloud Pub/Sub for pub/sub architecture (future extensibility)

Architecture Overview
Components:
API Layer (Express + Middleware)
Handles user requests to create/list/view bulk actions
Applies validation middleware
Database (PostgreSQL + Sequelize)
Stores bulk job metadata
Stores contact data
Queues (BullMQ + Redis)
Adds and processes bulk update jobs in batches
Supports delayed (scheduled) jobs
Workers
bulkWorker.ts: pulls jobs from the queue and processes them
Action Handlers
Pluggable handlers for actions like contact.update
Pub/Sub Layer (GCP PubSub Ready)
Decouples components for scalability (future feature)






Features Supported
1. 📅 Scheduling
Users can specify a scheduled_at timestamp
System uses BullMQ's delay option to queue jobs for the future
2. ✅ Batch Processing with Retry
Large jobs are split into batches of 1000
Each batch is retried up to 3 times with exponential backoff

3. 📈 Stats & Reporting
Tracks success_count, failure_count, skipped_count
Job status: scheduled, pending, processing, completed, failed
4. 📎 Entity-Agnostic Design
Designed to support multiple entity types (contacts, leads, etc.)
Uses dynamic key: ${entity_type}.${action_type}
5. ⚖️ Error Handling
Transactional updates
Failures logged with reasons
Graceful retries
6. ❓ Queue Health
/api/queue-status: Exposes health of BullMQ workers and queues.
7. ⚠️ Rate Limiting
Limits client requests using express-rate-limit to protect APIs.





💡 How to Test the Project
Step 1: Start Dependencies
# Start Redis
Redis-server


# Start PostgreSQL (if not already)
Step 2: Run Migrations & Seeders
npx sequelize-cli db:migrate
Step 3: Start Server and Worker
# Start server
npm run dev

# In another terminal
npm run worker
Step 4: Test with Postman or Curl
POST /api/bulk-update
Content-Type: application/json

{
  "action_type": "update",
  "entity_type": "contact",
  "contacts": [
    { "id": 1, "name": "Updated Name" }
  ],
  "scheduled_at": "2025-04-15T23:45:00Z"
}
Step 5: View Results
GET /api/bulk-actions/:id
GET /api/bulk-actions/:id/stats

📄 Optional Enhancements covered
Persist failed/skipped records in a new table - handling deduplication
API rate limiting
Scheduling
Load Testing - using a script to generate million of contacts and pushing to bullMQ using parallel worker processing


Testing Steps And APIs
Start Services
npm run migrate     # Run DB migrations
npm run seed        # Seed contact data
npm run dev         # Start Express server
npm run worker      # Start BullMQ worker
Create Immediate Job
POST /api/bulk-update
{
  "action_type": "update",
  "entity_type": "contact",
  "contacts": [
    {"id": 1, "name": "John Doe"},
    {"id": 2, "email": "john@x.com"}
  ]
}
Schedule Future Job
POST /api/bulk-update
{
  "action_type": "update",
  "entity_type": "contact",
  "scheduled_at": "2025-04-14T18:00:00.000Z",
  "contacts": [...]
}
View Job Status
GET /api/bulk-actions              # List all
GET /api/bulk-actions/:jobId       # Details
GET /api/bulk-actions/:jobId/stats # Stats
Queue Health
GET /api/queue-status




✅ Design Patterns Used
Factory Pattern
 Used for creating BullMQ jobs and Sequelize models with consistent configuration.


Strategy Pattern
 Allows easy plugging of new action types (e.g., update, delete) using actionHandlers.


Singleton Pattern
 Ensures single instances of critical components like BullMQ queues and database connections.


Middleware Pattern
 Express middleware for validation, rate limiting, and error handling.


Observer Pattern
 GCP Pub/Sub acts as the observable; workers act as observers reacting to new messages.


Command Pattern
 Encapsulates bulk operations (e.g., bulkUpdate) as commands for queuing and execution.


Repository Pattern
 Sequelize models abstract database access, separating persistence logic.


Template Method Pattern
 Batch processing follows a standard process (fetch → validate → update → log) with interchangeable handlers.


