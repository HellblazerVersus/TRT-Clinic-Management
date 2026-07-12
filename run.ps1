# ─────────────────────────────────────────────────────────────
#  TRT Clinic - Docker Run Script
#  Builds and starts the full stack (Postgres + Next.js app)
#  inside Docker containers.
#
#  Usage:
#    .\run.ps1              - Full start (build + migrate + start)
#    .\run.ps1 -SkipBuild   - Skip docker image rebuild
#    .\run.ps1 -SkipMigrate - Skip DB migration + seed
#    .\run.ps1 -Down        - Stop and remove all containers
#    .\run.ps1 -Logs        - Tail logs of running containers
# ─────────────────────────────────────────────────────────────

param(
    [switch]$SkipBuild,
    [switch]$SkipMigrate,
    [switch]$Down,
    [switch]$Logs
)

$ErrorActionPreference = "Stop"

function Write-Step { param($msg) Write-Host ""; Write-Host ">> $msg" -ForegroundColor Cyan }
function Write-Ok   { param($msg) Write-Host "   OK: $msg" -ForegroundColor Green }
function Write-Warn { param($msg) Write-Host "   WARN: $msg" -ForegroundColor Yellow }
function Write-Fail { param($msg) Write-Host "   FAIL: $msg" -ForegroundColor Red; exit 1 }

Write-Host ""
Write-Host "======================================" -ForegroundColor Magenta
Write-Host "  TRT Clinic - Docker Dev Environment " -ForegroundColor Magenta
Write-Host "======================================" -ForegroundColor Magenta

# ── Check Docker ─────────────────────────────────────────────
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Fail "Docker not found. Please install Docker Desktop."
}

$dockerRunning = docker info 2>&1 | Out-String
if ($LASTEXITCODE -ne 0) {
    Write-Fail "Docker daemon is not running. Please start Docker Desktop."
}
Write-Ok "Docker is running."

# ── Down mode ────────────────────────────────────────────────
if ($Down) {
    Write-Step "Stopping and removing all TRT containers..."
    docker compose down -v
    Write-Ok "All containers stopped and removed."
    exit 0
}

# ── Logs mode ────────────────────────────────────────────────
if ($Logs) {
    Write-Step "Tailing container logs (Ctrl+C to stop)..."
    docker compose logs -f
    exit 0
}

# ── Step 1: Start Postgres ────────────────────────────────────
Write-Step "Starting Postgres container..."
docker compose up -d postgres
Write-Ok "Postgres container started."

# ── Step 2: Wait for Postgres health ─────────────────────────
Write-Step "Waiting for Postgres to be healthy..."
$retries = 24
$healthy = $false
for ($i = 1; $i -le $retries; $i++) {
    $status = docker inspect --format "{{.State.Health.Status}}" trt_postgres 2>$null
    if ($status -eq "healthy") {
        $healthy = $true
        break
    }
    Write-Host "   ... attempt $i/$retries (status: $status)" -ForegroundColor DarkGray
    Start-Sleep -Seconds 3
}
if (-not $healthy) { Write-Fail "Postgres did not become healthy in time." }
Write-Ok "Postgres is healthy."

# ── Step 3: Run migrations + seed ────────────────────────────
if (-not $SkipMigrate) {
    Write-Step "Running DB migrations and seed (migrate profile)..."
    docker compose --profile migrate up migrate --no-deps --exit-code-from migrate
    if ($LASTEXITCODE -ne 0) {
        Write-Warn "Migrate container exited with non-zero code (may be OK if already migrated)."
    } else {
        Write-Ok "Migrations and seed complete."
    }
} else {
    Write-Warn "Skipping migrations (-SkipMigrate)."
}

# ── Step 4: Build + start the app ────────────────────────────
if (-not $SkipBuild) {
    Write-Step "Building Next.js app Docker image..."
    docker compose build app
    Write-Ok "Image built."
} else {
    Write-Warn "Skipping image build (-SkipBuild)."
}

Write-Step "Starting the app container..."
docker compose up -d app
Write-Ok "App container started."

# ── Step 5: Tail logs ────────────────────────────────────────
Write-Host ""
Write-Host "  App is starting at http://localhost:3000" -ForegroundColor Green
Write-Host "  pgAdmin is available at http://localhost:5050 (admin@clinic.com / admin123)" -ForegroundColor DarkGray
Write-Host ""
Write-Host "  Tailing logs... Press Ctrl+C to detach (containers keep running)." -ForegroundColor DarkGray
Write-Host ""

docker compose logs -f app
