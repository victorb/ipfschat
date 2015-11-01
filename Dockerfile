FROM mhart/alpine-node:4.2.1

ENV VERSION master

ADD start_daemon.sh /usr/local/bin/start_daemon

RUN apk add --update bash curl wget ca-certificates zip \
 && wget https://gobuilder.me/get/github.com/ipfs/go-ipfs/cmd/ipfs/ipfs_${VERSION}_linux-386.zip \
 && unzip ipfs_${VERSION}_linux-386.zip \
 && rm ipfs_${VERSION}_linux-386.zip \
 && mv ipfs/ipfs /usr/local/bin/ipfs \
 && chmod 755 /usr/local/bin/start_daemon \
 && apk del wget zip curl

EXPOSE 4001 5001 8080
ENTRYPOINT ["/usr/local/bin/start_daemon"]

# WORKDIR /src
# 
# ADD package.json /src/package.json
# 
# RUN npm install
# 
# ADD . /src/
