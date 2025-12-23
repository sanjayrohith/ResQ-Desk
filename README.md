# ResQ-Desk

**Real-time Emergency Response Management System**

ResQ-Desk is a comprehensive emergency dispatch and response management platform designed for emergency services. The system provides real-time call handling, AI-powered incident analysis, live transcription, and tactical resource deployment through an intuitive dashboard interface.

## System Overview

The platform integrates multiple critical emergency response functions into a unified interface:

- **Live Call Management**: Real-time emergency call handling with audio visualization and call controls
- **AI-Powered Transcription**: Automatic speech-to-text conversion with intelligent incident data extraction
- **Incident Analysis**: AI-assisted classification and severity assessment of emergency situations
- **Resource Deployment**: Interactive mapping system for unit tracking and tactical dispatch
- **Real-time Updates**: Live status monitoring and notification system

## Architecture

### Technology Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Frontend Framework** | React 18 + TypeScript | Type-safe UI development |
| **Build Tool** | Vite | Fast development and optimized builds |
| **Styling** | Tailwind CSS | Utility-first responsive design |
| **UI Components** | shadcn/ui + Radix UI | Accessible component library |
| **State Management** | TanStack Query | Server state and caching |
| **Routing** | React Router | Client-side navigation |
| **Speech Recognition** | Web Speech API | Real-time audio transcription |
| **Audio Processing** | Web Audio API | Voice visualization and analysis |

### Core Components

#### 1. Header Component
**File**: [`src/components/dashboard/Header.tsx`](src/components/dashboard/Header.tsx)

The main navigation header providing system status and branding.

**Features**:
- Real-time clock display with precise formatting
- System status indicators (connectivity, latency)
- Active incident counters with visual alerts
- Responsive design with mobile optimization

#### 2. Live Call Management
**File**: [`src/components/dashboard/LiveCall.tsx`](src/components/dashboard/LiveCall.tsx)

Handles active emergency call sessions with comprehensive audio controls.

**Features**:
- Real-time call timer with precise duration tracking
- Audio visualization with frequency analysis
- Call control buttons (mute, hold, end call)
- Language detection and latency monitoring
- Microphone access and audio level visualization

#### 3. Live Transcription System
**File**: [`src/components/dashboard/LiveTranscription.tsx`](src/components/dashboard/LiveTranscription.tsx)

Real-time speech-to-text conversion with intelligent processing.

**Features**:
- Continuous speech recognition using Web Speech API
- Live transcript buffer with real-time updates
- Historical transcript logging with timestamps
- Expandable/collapsible interface for space optimization
- Automatic line completion detection and processing

#### 4. Incident Details Panel
**File**: [`src/components/dashboard/IncidentDetails.tsx`](src/components/dashboard/IncidentDetails.tsx)

AI-powered incident analysis and data management interface.

**Features**:
- Dynamic incident classification and severity assessment
- Real-time victim count tracking with visual indicators
- Location triangulation and display
- Priority level management with color-coded alerts
- Tactical alert flags and special condition monitoring
- Call duration tracking and status indicators

#### 5. Interactive Map Panel
**File**: [`src/components/dashboard/MapPanel.tsx`](src/components/dashboard/MapPanel.tsx)

Tactical resource deployment and unit tracking system.

**Features**:
- Interactive SVG-based mapping interface
- Real-time unit positioning and status tracking
- Distance calculation and ETA estimation
- Resource selection and dispatch capabilities
- Visual connection paths between incidents and units
- Satellite link status and coordinate display

#### 6. Main Dashboard
**File**: [`src/pages/Index.tsx`](src/pages/Index.tsx)

Central orchestration component managing all dashboard interactions.

**Features**:
- State management for incident data and call sessions
- AI backend integration for transcript analysis
- Real-time data synchronization between components
- Call history management and persistence
- Responsive grid layout with professional spacing

## Installation and Setup

### Prerequisites

- Node.js 18.0 or higher
- npm or bun package manager
- Modern web browser with Web Speech API support

### Development Setup

```bash
# Clone the repository
git clone <repository-url>
cd ResQ-Desk

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

### Production Build

```bash
# Create optimized production build
npm run build

# Preview production build locally
npm run preview
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Create optimized production build |
| `npm run build:dev` | Create development build |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint code analysis |

## Project Structure

```
src/
├── components/
│   ├── dashboard/           # Core dashboard components
│   │   ├── Header.tsx       # Navigation and system status
│   │   ├── LiveCall.tsx     # Call management interface
│   │   ├── LiveTranscription.tsx  # Speech-to-text system
│   │   ├── IncidentDetails.tsx    # AI-powered incident analysis
│   │   ├── MapPanel.tsx     # Resource deployment interface
│   │   └── index.ts         # Component exports
│   └── ui/                  # Reusable UI components (shadcn/ui)
├── hooks/                   # Custom React hooks
├── lib/                     # Utility functions and configurations
├── pages/                   # Page components and routing
│   ├── Index.tsx           # Main dashboard page
│   └── NotFound.tsx        # 404 error page
├── App.tsx                 # Application root component
└── main.tsx                # Application entry point
```

## Component Integration

The dashboard components work together through a centralized state management system:

1. **LiveTranscription** captures speech and sends completed lines to the main dashboard
2. **Main Dashboard** processes transcripts through AI backend integration
3. **IncidentDetails** displays extracted incident data with real-time updates
4. **MapPanel** uses incident data to enable resource deployment
5. **LiveCall** manages call state and triggers data processing workflows

## Browser Compatibility

- Chrome 80+ (recommended)
- Firefox 76+
- Safari 14+
- Edge 80+

**Note**: Web Speech API support required for transcription functionality.

## License

MIT License - see LICENSE file for details.
