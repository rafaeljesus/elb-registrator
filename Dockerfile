FROM mhart/alpine-node:6

MAINTAINER ContainerShip Developers <developers@containership.io>

RUN mkdir /app
ADD . /app
WORKDIR /app
RUN npm install
CMD ["npm", "start"]
