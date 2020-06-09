# Build docker image from the build in ./dist directory.
# Use Dockerfile from ./docker directory to build the latest sources
# from the git repository.

# context should be "dist"

FROM mhart/alpine-node:slim-12
WORKDIR /svc/codenames
ADD . /svc/codenames/
VOLUME /svc/codenames/data
ENV NODE_ENV production
ENV NO_CONSOLE_COLORS 0
ENV CODENAMES_HTTP_PORT 8095
ENV MONGO_CONNECTION_STRING mongodb://localhost/codenames
ENTRYPOINT node ./server/main.js
EXPOSE 8095
