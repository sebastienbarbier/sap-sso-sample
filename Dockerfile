FROM node:10 AS builder

RUN mkdir -p /app
RUN mkdir -p /app/backend
RUN mkdir -p /app/frontend

WORKDIR /app/backend
COPY ./backend .
RUN npm install

WORKDIR /app/frontend
COPY ./frontend .
#RUN npm install

WORKDIR /app
RUN cp -r ./frontend/ ./backend/static

WORKDIR /app/backend
CMD [ "npm", "start" ]