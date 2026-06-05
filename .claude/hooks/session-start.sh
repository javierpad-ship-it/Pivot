#!/bin/bash
set -euo pipefail

# Solo ejecutar en entornos remotos (Claude Code en la web)
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "${CLAUDE_PROJECT_DIR:-$(pwd)}"

echo "→ Instalando dependencias npm (incluye prisma generate)..."
npm install

# Crear .env si no existe, usando .env.example como base
if [ ! -f .env ] && [ -f .env.example ]; then
  echo "→ Creando .env desde .env.example..."
  cp .env.example .env
fi

echo "✓ Entorno listo"
