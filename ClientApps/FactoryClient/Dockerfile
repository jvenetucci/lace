FROM node:8.11.2

COPY . /usr/src/FactoryClient
WORKDIR /usr/src/FactoryClient

EXPOSE 3000

# Update npm
# RUN npm install npm@latest -g
RUN npm install --silent

CMD ["npm", "start"]