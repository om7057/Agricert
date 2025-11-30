#!/bin/bash

# AgriQCert + Inji Certify Setup Script
# This script prepares the environment for running Inji Certify with AgriQCert

set -e

echo "🚀 Setting up Inji Certify integration..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Change to script directory
cd "$(dirname "$0")"

echo -e "${YELLOW}Step 1: Creating necessary directories...${NC}"
mkdir -p inji-certify/docker-compose/docker-compose-injistack/data/CERTIFY_PKCS12
mkdir -p inji-certify/docker-compose/docker-compose-injistack/certs
mkdir -p inji-certify/docker-compose/docker-compose-injistack/loader_path/certify

echo -e "${GREEN}✓ Directories created${NC}"

echo -e "${YELLOW}Step 2: Checking configuration files...${NC}"

CONFIG_DIR="inji-certify/docker-compose/docker-compose-injistack/config"

if [ -f "$CONFIG_DIR/certify-default.properties" ]; then
    echo -e "${GREEN}✓ Certify config files found${NC}"
else
    echo -e "${RED}✗ Certify config files not found!${NC}"
    echo "Please ensure inji-certify repository files are present"
    exit 1
fi

echo -e "${YELLOW}Step 3: Checking Docker network...${NC}"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}✗ Docker is not running. Please start Docker first.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Docker is running${NC}"

echo -e "${YELLOW}Step 4: Configuration check...${NC}"

# Check if DID URL is configured
if grep -q "did:web:someuser.github.io" "$CONFIG_DIR/certify-csvdp-farmer.properties" 2>/dev/null; then
    echo -e "${YELLOW}⚠ DID URL is still using default value${NC}"
    echo "  You should update mosip.certify.data-provider-plugin.did-url in:"
    echo "  $CONFIG_DIR/certify-csvdp-farmer.properties"
    echo ""
    echo "  Current value: did:web:someuser.github.io:somerepo:somedirectory"
    echo "  Replace with your actual DID hosting location"
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo -e "${GREEN}✓ Configuration check complete${NC}"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Next steps:"
echo ""
echo "1. Start all services:"
echo -e "   ${YELLOW}docker compose up -d${NC}"
echo ""
echo "2. Check service status:"
echo -e "   ${YELLOW}docker compose ps${NC}"
echo ""
echo "3. View logs:"
echo -e "   ${YELLOW}docker compose logs -f inji-certify${NC}"
echo ""
echo "4. Access services:"
echo "   - AgriQCert Backend: http://localhost:5000"
echo "   - PostgreSQL: localhost:5432"
echo "   - Redis: localhost:6379"
echo "   - Inji Certify: http://localhost:8090"
echo "   - Inji Certify (via nginx): http://localhost:8091"
echo ""
echo "5. Get DID document (after services start):"
echo -e "   ${YELLOW}curl http://localhost:8090/v1/certify/.well-known/did.json${NC}"
echo ""
echo "6. Check Inji Certify health:"
echo -e "   ${YELLOW}curl http://localhost:8090/v1/certify/actuator/health${NC}"
echo ""
echo -e "${YELLOW}Note: Inji Certify may take 1-2 minutes to fully start${NC}"
echo ""
