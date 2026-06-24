# Skoolific V2 Desktop Application

## Overview
Native desktop application built with Tauri 2.0 for school administrators and super admins.

## Features
- **Admin App**: Full system management capabilities for school administrators
- **Super Admin App**: Cross-branch data aggregation and reporting
- Secure credential storage using OS keychain
- Native desktop notifications
- System tray integration
- Auto-update mechanism

## Technology Stack
- **Framework**: Tauri 2.0 (Rust backend + React frontend)
- **Frontend**: React.js with Vite
- **Backend**: Rust

## Setup Instructions
This workspace is a placeholder. Tauri setup will be completed in Phase 1.3 of the implementation plan.

### Prerequisites
- Node.js >= 18.0.0
- Rust toolchain
- Platform-specific dependencies (see Tauri documentation)

### Installation
```bash
# From workspace root
npm install

# Install Tauri CLI
npm install --save-dev @tauri-apps/cli
```

### Development
```bash
# Run in development mode (after Tauri setup)
npm run dev --workspace=packages/desktop
```

### Build
```bash
# Build for production (after Tauri setup)
npm run build --workspace=packages/desktop
```

## Status
🚧 **Under Development** - Placeholder workspace created. Full implementation pending.
