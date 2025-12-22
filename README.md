# ResQDesk - Emergency Response Dashboard

A real-time emergency dispatch and response management system built with modern web technologies.

## Features

- 🚨 Live emergency call handling with real-time transcription
- 🗺️ Interactive map with unit tracking and dispatch
- 📋 AI-assisted incident details extraction
- ⚡ Real-time status updates and notifications

## Tech Stack

- **Vite** - Fast build tool and dev server
- **React** - UI library
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Accessible component library
- **React Router** - Client-side routing
- **TanStack Query** - Server state management

## Getting Started

### Prerequisites

- Node.js 18+ (recommended: use [nvm](https://github.com/nvm-sh/nvm))
- npm or bun

### Installation

```sh
# Clone the repository
git clone <YOUR_GIT_URL>
cd resqdesk

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at `http://localhost:8080`

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## Project Structure

```
src/
├── components/
│   ├── dashboard/    # Dashboard-specific components
│   └── ui/           # Reusable UI components (shadcn/ui)
├── hooks/            # Custom React hooks
├── lib/              # Utility functions
├── pages/            # Page components
└── main.tsx          # Application entry point
```

## License

MIT
