# Use an official Nginx runtime as a parent image
FROM nginx:alpine

# Set working directory
WORKDIR /usr/share/nginx/html

# Copy the entire project to the container
COPY . .

# Install Node.js (if needed for any build processes)
# Uncomment these lines if you require Node.js
# RUN apk add --update nodejs npm
# RUN npm install

# Expose the port that Nginx will listen on
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]