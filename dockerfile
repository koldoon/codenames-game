# Build docker image from the build in ./dist directory.
# Use Dockerfile from ./docker directory to build the latest sources
# from the git repository.

FROM mhart/alpine-node:slim-12
WORKDIR /svc/codenames
ADD dist /svc/codenames/
ENTRYPOINT node ./server/main.js
EXPOSE 8095
