#!/bin/bash

# Set environment variables
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/care?schema=public"
export AUTH_SECRET="your-test-secret-key-for-development"
export NEXTAUTH_URL="http://localhost:3002"
export NEXTAUTH_SECRET="your-test-secret-key-for-development"
export NEXT_PUBLIC_API_URL="http://localhost:3002/api"

# Set up database
echo "Setting up database..."
npx prisma db push

# Start the development server in the background
echo "Starting development server..."
npm run dev &
SERVER_PID=$!

# Wait for the server to start
echo "Waiting for server to start..."
sleep 5

# Set up permissions
echo "Setting up permissions..."
npx tsx scripts/setup-permissions.ts

# Run the tests
echo "Running tests..."
npx tsx scripts/test-industries.ts

# Kill the development server
echo "Stopping development server..."
kill $SERVER_PID

echo "Tests completed!" 