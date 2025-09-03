#!/bin/bash

# BotSight Deployment Script

echo "🚀 Starting BotSight Deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the BotSight root directory"
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

echo "🏗️ Building all packages..."
npm run build

echo "🗄️ Setting up database..."
cd server

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found. Please create one with your database configuration."
    echo "   See server/.env.example for an example."
else
    echo "✅ Using existing .env configuration"
fi

echo "🔄 Running database migrations..."
npm run migrate

echo "🌱 Seeding database..."
npm run seed

echo "📡 Starting BotSight server..."
npm start &

# Wait a moment for the server to start
sleep 3

echo "👷 Starting simulation worker..."
npm run worker &

echo "🔄 Starting agent sync job..."
npm run sync-agents &

echo "✅ BotSight deployment completed!"
echo ""
echo "📝 Next steps:"
echo "1. Make sure your database is accessible"
echo "2. Verify the .env file contains correct configuration"
echo "3. Upload the snippet from packages/snippet/dist/botsight.iife.js to your web server"
echo "4. Add the snippet to your website:"
echo '   <script src="https://your-website.com/path/to/botsight.iife.js" data-site-id="your-site-id" async></script>'
echo ""
echo "📊 Monitor your database using the queries in DATABASE_OPERATIONS.md"
echo "🧪 Test the system by visiting your website and checking the visits table"