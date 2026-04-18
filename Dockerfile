# Stage 1: Install dependencies and build
FROM node:22-alpine AS builder
WORKDIR /app

# Copy package files to cache layers
COPY package*.json ./
RUN npm install

# Copy source and build
COPY . .
RUN npm run build

# Stage 2: Production Runner
FROM node:22-alpine AS runner
WORKDIR /app

# Set to production to optimize React
ENV NODE_ENV=production

# 1. ONLY copy the necessary standalone files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

# 2. Add a non-root user for security (Professional Standard)
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

EXPOSE 3000

# Next.js 13+ handles 'npm start' well, but in extreme production, 
# people use 'node_modules/.bin/next start'
CMD ["npm", "start"]