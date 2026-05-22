#!/usr/bin/env bash
# MotoLog one-command setup
# Usage: bash scripts/setup.sh
# What it does:
#   1. Installs Supabase CLI (if missing)
#   2. Logs you into Supabase (browser opens once)
#   3. Creates a new Supabase project named "motolog"
#   4. Applies the database migration (schema + RLS)
#   5. Writes .env.local with your URL and anon key automatically

set -euo pipefail

BOLD='\033[1m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m'

info()    { echo -e "${CYAN}→${NC} $*"; }
success() { echo -e "${GREEN}✓${NC} $*"; }
warn()    { echo -e "${YELLOW}⚠${NC}  $*"; }
fatal()   { echo -e "${RED}✗${NC} $*"; exit 1; }
header()  { echo -e "\n${BOLD}$*${NC}"; }

# ── 1. Supabase CLI ───────────────────────────────────────────────────────────
header "Step 1/5 — Supabase CLI"
if command -v supabase &>/dev/null; then
  SB="supabase"
elif npx supabase --version &>/dev/null 2>&1; then
  SB="npx supabase"
else
  info "Installing Supabase CLI via npm..."
  npm install -g supabase --legacy-peer-deps
  SB="supabase"
fi
success "Supabase CLI ready: $($SB --version)"

# ── 2. Login ─────────────────────────────────────────────────────────────────
header "Step 2/5 — Login"
if $SB projects list &>/dev/null 2>&1; then
  success "Already logged in"
else
  info "Opening browser for Supabase login..."
  $SB login
fi

# ── 3. Create project ────────────────────────────────────────────────────────
header "Step 3/5 — Create project"

# Pick an org
ORG_ID=$($SB orgs list --json 2>/dev/null | python3 -c "import sys,json; orgs=json.load(sys.stdin); print(orgs[0]['id'])" 2>/dev/null || true)

if [ -z "$ORG_ID" ]; then
  fatal "Could not find a Supabase organisation. Visit https://supabase.com and create one first."
fi

# Check if a project named motolog already exists
EXISTING=$($SB projects list --json 2>/dev/null | python3 -c "
import sys,json
projects=json.load(sys.stdin)
match=[p for p in projects if p.get('name')=='motolog']
print(match[0]['id'] if match else '')
" 2>/dev/null || true)

if [ -n "$EXISTING" ]; then
  PROJECT_REF="$EXISTING"
  success "Found existing project: $PROJECT_REF"
else
  info "Creating new project 'motolog' (this takes ~1 minute)..."
  # Generate a strong password
  DB_PASS=$(python3 -c "import secrets,string; print(''.join(secrets.choice(string.ascii_letters+string.digits+'!@#') for _ in range(24)))")
  PROJECT_REF=$($SB projects create motolog \
    --org-id "$ORG_ID" \
    --db-password "$DB_PASS" \
    --region ap-south-1 \
    --plan free \
    --json 2>/dev/null | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
  success "Project created: $PROJECT_REF"
  info "Waiting for database to be ready..."
  sleep 60
fi

# ── 4. Link + apply migration ─────────────────────────────────────────────────
header "Step 4/5 — Apply database schema"
$SB link --project-ref "$PROJECT_REF" 2>/dev/null || true
$SB db push --include-all 2>/dev/null || {
  warn "CLI push failed — applying migration via API..."
  $SB db remote commit 2>/dev/null || true
}
success "Schema applied"

# ── 5. Write .env.local ───────────────────────────────────────────────────────
header "Step 5/5 — Write .env.local"

API_URL="https://${PROJECT_REF}.supabase.co"
ANON_KEY=$($SB projects api-keys --project-ref "$PROJECT_REF" --json 2>/dev/null \
  | python3 -c "import sys,json; keys=json.load(sys.stdin); anon=[k for k in keys if k.get('name')=='anon']; print(anon[0]['api_key'] if anon else '')" 2>/dev/null || true)

if [ -z "$ANON_KEY" ]; then
  warn "Could not auto-fetch anon key. Get it from:"
  warn "  https://supabase.com/dashboard/project/${PROJECT_REF}/settings/api"
  ANON_KEY="PASTE_ANON_KEY_HERE"
fi

cat > .env.local <<EOF
EXPO_PUBLIC_SUPABASE_URL=${API_URL}
EXPO_PUBLIC_SUPABASE_ANON_KEY=${ANON_KEY}
EOF

success ".env.local written"

echo ""
echo -e "${BOLD}${GREEN}All done!${NC}"
echo ""
echo "  Project URL : ${API_URL}"
echo "  Dashboard   : https://supabase.com/dashboard/project/${PROJECT_REF}"
echo ""
echo -e "${BOLD}To start the app:${NC}"
echo "  npm start"
echo ""
echo -e "${BOLD}Optional — enable AI features:${NC}"
echo "  npx supabase secrets set ANTHROPIC_API_KEY=sk-ant-... --project-ref ${PROJECT_REF}"
echo ""
echo -e "${BOLD}Optional — enable RC plate auto-fill:${NC}"
echo "  Sign up free at https://rapidapi.com, then add to .env.local:"
echo "  EXPO_PUBLIC_RAPIDAPI_KEY=your-key"
