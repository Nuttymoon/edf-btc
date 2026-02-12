#!/bin/bash
set -e

DOMAIN="edf-btc.fr"
EMAIL="your-email@example.com"  # ← Change this!

echo ">>> Starting NGINX for ACME challenge..."

# Create a temporary HTTP-only nginx config (no SSL)
cat > nginx/nginx.conf.tmp <<'EOF'
server {
    listen 80;
    server_name edf-btc.fr www.edf-btc.fr;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 200 'Setting up SSL...';
        add_header Content-Type text/plain;
    }
}
EOF

# Swap in the temporary config
cp nginx/nginx.conf nginx/nginx.conf.bak
cp nginx/nginx.conf.tmp nginx/nginx.conf

# Start only nginx (no SSL yet, so nextjs isn't needed)
docker compose up -d nginx

echo ">>> Requesting certificate from Let's Encrypt..."
docker compose run --rm certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email "$EMAIL" \
    --agree-tos \
    --no-eff-email \
    -d "$DOMAIN" \
    -d "www.$DOMAIN"

echo ">>> Restoring full NGINX config with SSL..."
cp nginx/nginx.conf.bak nginx/nginx.conf
rm nginx/nginx.conf.tmp nginx/nginx.conf.bak

echo ">>> Starting all services..."
docker compose down
docker compose up -d

echo ""
echo "Done! https://$DOMAIN should be live."

