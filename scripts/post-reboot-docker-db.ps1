# Run AFTER reboot (PowerShell as user is fine for Docker; admin only if docker fails)
# Sets up local Postgres for TennisPool and writes .env.local

$ErrorActionPreference = 'Stop'
$ProjectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $ProjectRoot

Write-Host "==> Checking WSL / virtualization..."
wsl --status
wsl --set-default-version 2 2>$null

Write-Host "==> Starting Docker Desktop..."
$dockerDesktop = @(
  "$env:ProgramFiles\Docker\Docker\Docker Desktop.exe",
  "${env:ProgramFiles(x86)}\Docker\Docker\Docker Desktop.exe"
) | Where-Object { Test-Path $_ } | Select-Object -First 1

if (-not $dockerDesktop) { throw "Docker Desktop not found" }
Start-Process -FilePath $dockerDesktop

$ready = $false
for ($i = 1; $i -le 60; $i++) {
  Start-Sleep -Seconds 3
  docker info 2>$null | Out-Null
  if ($LASTEXITCODE -eq 0) { $ready = $true; Write-Host "Docker ready ($($i*3)s)"; break }
  Write-Host "Waiting Docker... $i"
}
if (-not $ready) { throw "Docker engine did not start. Open Docker Desktop and check errors." }

Write-Host "==> Starting Postgres container..."
docker rm -f tennispool-db 2>$null | Out-Null
docker run -d `
  --name tennispool-db `
  -e POSTGRES_USER=tennis `
  -e POSTGRES_PASSWORD=tennis `
  -e POSTGRES_DB=tennispool `
  -p 5435:5432 `
  --restart unless-stopped `
  postgres:16-alpine

Write-Host "==> Waiting for Postgres..."
for ($i = 1; $i -le 30; $i++) {
  docker exec tennispool-db pg_isready -U tennis 2>$null | Out-Null
  if ($LASTEXITCODE -eq 0) { break }
  Start-Sleep -Seconds 2
}

$connection = 'postgresql://tennis:tennis@localhost:5435/tennispool'

Write-Host "==> Writing .env.local..."
@"
# Local Docker Postgres (dev)
NEON_CONNECTION_STRING=$connection

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
"@ | Set-Content -Path (Join-Path $ProjectRoot '.env.local') -Encoding UTF8

Write-Host "==> Applying local schema (init-local-schema.sql)..."
Get-Content (Join-Path $ProjectRoot 'scripts\init-local-schema.sql') -Raw |
  docker exec -i tennispool-db psql -U tennis -d tennispool

Write-Host ""
Write-Host "OK. Connection string:"
Write-Host $connection
Write-Host ""
Write-Host "Next: npm run dev"
Write-Host "Then open http://localhost:3000"
