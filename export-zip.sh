#!/usr/bin/env bash
# ==============================================================================
# TontinePro Lite - Script de Compression et Exportation ZIP
# Crée une archive propre excluant node_modules, dist et fichiers temporaires
# ==============================================================================

set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUTPUT="$DIR/public/tontinepro-lite.zip"

echo "📦 Préparation de l'archive TontinePro Lite..."

# Si python3 est disponible, utiliser le script de compression optimisé
if command -v python3 &>/dev/null; then
    python3 "$DIR/scripts/build_zip.py"
    echo "✅ Archive ZIP générée avec succès dans : $OUTPUT"
    exit 0
fi

# Sinon, utiliser la commande standard zip
if command -v zip &>/dev/null; then
    cd "$DIR"
    mkdir -p "$DIR/public"
    zip -r "$OUTPUT" . \
        -x "node_modules/*" \
        -x "dist/*" \
        -x ".git/*" \
        -x ".vite/*" \
        -x ".cache/*" \
        -x "*.zip" \
        -x ".DS_Store"
    echo "✅ Archive ZIP générée avec succès : $OUTPUT"
    exit 0
fi

echo "❌ Erreur : Ni python3 ni la commande zip ne sont installés sur ce système."
exit 1
