# Use an official Node.js runtime as a parent image
FROM node:14

# Set the working directory in the container
WORKDIR /src

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Build the React app for production
RUN npm run build

# Expose port 3000 for the React app
EXPOSE 3000

# Define the command to run your React app
CMD ["npm", "start"]
