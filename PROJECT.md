# ResQ-Desk
## Introduction
ResQ-Desk is a real-time emergency response management system built with React, TypeScript, and Vite.

## Getting Started
To get started, clone the repository and run the following commands:

```bash
npm ci
npm run dev
```

## Docker
To build and run the application using Docker, use the following commands:

```bash
docker build -t app .
docker run -p 80:80 app
```

## Docker Compose
To use Docker Compose, run the following commands:

```bash
docker-compose up --build
```

## AI_CHANGES
The following changes were made by the AI:
* Created a multi-stage Dockerfile for building and serving the application
* Added a `docker-compose.dev.yml` file for local development
* Added a `docker-compose.yml` file for production
* Created a `.dockerignore` file to exclude unnecessary files from the Docker build context
* Added a `nginx.conf` file for serving static assets
* Updated the `package.json` file to include a `build` script
