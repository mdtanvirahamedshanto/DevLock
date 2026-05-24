#!/bin/bash
set -e

echo "═══════════════════════════════════════════"
echo "  DevLock Development Setup"
echo "═══════════════════════════════════════════"
echo ""

# Check prerequisites
command -v node >/dev/null 2>&1 || { echo "❌ Node.js is required. Install from https://nodejs.org"; exit 1; }
command -v pnpm >/dev/null 2>&1 || { echo "❌ pnpm is required. Run: npm install -g pnpm"; exit 1; }
command -v docker >/dev/null 2>&1 || { echo "❌ Docker is required. Install from https://docker.com"; exit 1; }

echo "✅ Prerequisites met"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Copy environment file
if [ ! -f .env ]; then
  echo "📋 Creating .env from .env.example..."
  cp .env.example .env
  echo "   ⚠️  Edit .env with your configuration"
fi

# Generate keys
echo "🔐 Generating cryptographic keys..."
pnpm generate:keys

# Start infrastructure
echo "🐳 Starting Docker services (MongoDB, Redis)..."
pnpm docker:up

# Wait for services
echo "⏳ Waiting for services to be ready..."
sleep 5

# Build packages
echo "🔨 Building shared packages..."
pnpm build --filter @devlock/shared --filter @devlock/db

# Seed database
echo "🌱 Seeding database..."
# pnpm db:seed  # Uncomment when seed script is ready

echo ""
echo "═══════════════════════════════════════════"
echo "  ✅ Setup complete!"
echo ""
echo "  Start development:"
echo "    pnpm dev"
echo ""
echo "  Services:"
echo "    Dashboard:  http://localhost:4000"
echo "    API:        http://localhost:3000"
echo "    WebSocket:  ws://localhost:3010"
echo "═══════════════════════════════════════════"
