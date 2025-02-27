# Use Node.js as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and yarn.lock
COPY package.json yarn.lock ./

# Install dependencies using Yarn
RUN yarn install --frozen-lockfile

# Copy the entire Strapi project
COPY . .

# Build Strapi admin panel
RUN yarn build

# Expose Strapi's default port
EXPOSE 1337

# Start the Strapi app
CMD ["yarn", "start"]
