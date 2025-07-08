#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting Sam Dashboard...${NC}"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: Please run this script from the sam-app root directory${NC}"
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    pnpm install
fi

# Check if dashboard node_modules exists
if [ ! -d "dashboard/node_modules" ]; then
    echo -e "${YELLOW}📦 Installing dashboard dependencies...${NC}"
    pnpm install
fi

echo -e "${GREEN}✅ Dependencies ready${NC}"

# Start the dashboard
echo -e "${BLUE}🌐 Starting dashboard on http://localhost:3001${NC}"
echo -e "${YELLOW}💡 Make sure your API server is running on http://localhost:3000${NC}"
echo -e "${YELLOW}💡 Press Ctrl+C to stop the server${NC}"
echo ""

pnpm dev:dashboard
