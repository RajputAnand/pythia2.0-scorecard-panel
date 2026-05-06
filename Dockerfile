FROM node:24.15-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY ./ ./
RUN chmod +x ./run.sh
ENTRYPOINT [ "/bin/sh" ]
CMD [ "./run.sh" ]
