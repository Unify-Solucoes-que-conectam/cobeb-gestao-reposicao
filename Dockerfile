# syntax=docker/dockerfile:1

FROM oven/bun:1.2.23-alpine AS build

WORKDIR /app

COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

COPY . .

# Variaveis VITE sao incorporadas ao bundle no momento do build.
ARG VITE_API_URL=http://localhost:8000
ARG VITE_APP_MODE=production
ARG REVERB_BROWSER_ID=
ARG VITE_REVERB_HOST=localhost
ARG VITE_REVERB_PORT=8080
ARG VITE_REVERB_SCHEME=http

# A chave publica do Reverb precisa fazer parte do bundle usado pelo navegador.
# O nome do ARG deixa explicito que nao se trata do APP_SECRET do Reverb.
RUN VITE_REVERB_APP_KEY="${REVERB_BROWSER_ID}" bun run build

FROM nginx:1.28-alpine AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://127.0.0.1/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
