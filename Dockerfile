FROM node:16-alpine AS build
WORKDIR /usr/src/app
COPY . .
RUN yarn && npm install vodafone-station-cli &&\
      npm prune --production

FROM alpine
RUN apk add --no-cache nodejs
WORKDIR /usr/src/app
COPY --from=build /usr/src/app/node_modules ./node_modules
ENTRYPOINT ["/usr/src/app/node_modules/vodafone-station-cli/bin/run"]
