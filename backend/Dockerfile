FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm install --omit=dev
COPY --from=build /app/dist ./dist
COPY --from=build /app/tsconfig.json ./tsconfig.json
COPY --from=build /app/src ./src
RUN npm install ts-node tsconfig-paths typescript --no-save
EXPOSE 3000
CMD ["node", "dist/main.js"]
