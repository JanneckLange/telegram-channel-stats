FROM node:13-alpine

WORKDIR /usr/src/app

# Copy package.json to the WORKDIR
COPY package*.json ./

# Install Python
RUN apk update
RUN apk add --no-cache curl jq python3 py3-pip
RUN pip3 install --upgrade pip
RUN pip3 install pytz telethon

# Install Dependencys
RUN npm install;

# Copy server.js, etc...
COPY . .

# Run the scripts command in the package.json
CMD ["npm", "start"]
