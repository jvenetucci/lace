# Current stable build of Node as of 5/27/18
FROM node:8.11.2

COPY . /usr/src/server
WORKDIR /usr/src/server

# By default have this run on 5001
EXPOSE 5001

# Update npm
# RUN npm install npm@latest -g
RUN npm install --silent

CMD ["npm", "start"]