#!/bin/bash

# Contexto Svenska - Secure Server + Client Startup Script
echo "🚀 Starting Contexto Svenska with Secure Server..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Navigate to the project directory
cd "$(dirname "$0")"

# Install server dependencies if needed
if [ ! -d "server/node_modules" ]; then
    echo "📦 Installing server dependencies..."
    cd server
    npm install
    cd ..
fi

# Install client dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing client dependencies..."
    npm install
fi

# Create server .env file if it doesn't exist
if [ ! -f "server/.env" ]; then
    echo "⚙️  Creating server .env file..."
    cp server/env.example server/.env
    echo "✅ Server .env created. Please update with your Firebase credentials."
fi

# Start the server in background
echo "🔒 Starting secure server on port 3001..."
cd server
npm start &
SERVER_PID=$!
cd ..

# Wait a moment for server to start
sleep 3

# Start the client
echo "🎮 Starting client on port 5173..."
npm run dev &
CLIENT_PID=$!

# Function to cleanup on exit
cleanup() {
    echo "🛑 Shutting down servers..."
    kill $SERVER_PID 2>/dev/null
    kill $CLIENT_PID 2>/dev/null
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

echo "✅ Both servers are running!"
echo "🔒 Secure Server: http://localhost:3001"
echo "🎮 Client: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for processes
wait
