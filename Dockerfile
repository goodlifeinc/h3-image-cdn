ARG NODE_VERSION=20
FROM node:${NODE_VERSION} as build
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy source files
COPY . .

# Build application
RUN npm run build

FROM docker.io/node:${NODE_VERSION}-alpine as runtime
WORKDIR /app

ARG PORT=3000
EXPOSE ${PORT}

COPY --from=build /app /app

CMD [ "dist/index.cjs" ]

# docker build --build-arg NODE_VERSION=20 -t my/test-app .
