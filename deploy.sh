#!/bin/bash

# Script de deployment para Vercel
echo "🚀 Iniciando deployment en Vercel..."

# Verificar autenticación
if ! vercel whoami > /dev/null 2>&1; then
    echo "❌ No estás autenticado en Vercel"
    exit 1
fi

echo "✅ Autenticado en Vercel como: $(vercel whoami)"

# Verificar que estamos en el directorio correcto
if [ ! -f "index.html" ]; then
    echo "❌ No se encontró index.html en el directorio actual"
    exit 1
fi

echo "✅ Archivo index.html encontrado"

# Intentar deployment
echo "🔄 Intentando deployment..."
vercel --prod --confirm

echo "🎉 Deployment completado!"
