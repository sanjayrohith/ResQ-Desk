# ResQ-Desk

Real-time AI-powered emergency response management system. Dispatchers receive emergency calls, the system transcribes speech live, sends transcripts to an AI backend for analysis, and auto-fills incident forms with structured data (location, emergency type, severity, keywords). The system then suggests the optimal response unit and dispatches alerts to volunteers via Telegram.

## Core Workflow

1. Operator activates push-to-talk, caller speaks
2. Browser Speech API transcribes audio in real-time
3. Transcript is sent to the backend `/analyze` endpoint
4. AI (AWS Bedrock / mock mode) extracts structured incident data
5. Orchestrator selects the best available response unit by ETA
6. Frontend auto-fills the incident form and shows a dispatch popup
7. Telegram bot notifies volunteers with incident details

## Key Concepts

- Incident: An emergency event with type (Fire/Flood/Medical), severity (Critical/High/Normal), location, and keywords
- Unit: An emergency response vehicle (FIRE_ENGINE, AMBULANCE, RESCUE_BOAT) with availability status and ETA
- Mock mode: A simulation flag in the backend that returns hardcoded AI responses for demos without AWS costs
