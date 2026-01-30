FROM node:22

ENV PNPM_HOME="/root/.local/share/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN wget -qO- https://get.pnpm.io/install.sh | ENV="$HOME/.shrc" SHELL="$(which sh)" sh -

# Create app directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install packages
RUN pnpm install

# Copy the app code
COPY . .

# Build the project
RUN pnpm run commands:register

# Expose ports
EXPOSE 3001

# Run the application
CMD [ "node", "--enable-source-maps", "dist/start-manager.js" ]
