FROM python:3.8
USER root

RUN apt-get update
RUN apt-get -y install locales && \
    localedef -f UTF-8 -i ja_JP ja_JP.UTF-8
ENV LANG ja_JP.UTF-8
ENV LANGUAGE ja_JP:ja
ENV LC_ALL ja_JP.UTF-8
ENV TZ JST-9
ENV TERM xterm

RUN apt-get install -y vim less
RUN apt-get install -y postgresql
RUN apt-get install -y libgl1-mesa-dev

#node.js reactを入れて行く
WORKDIR /root/face-api
RUN apt-get install -y nodejs npm
RUN npm i -g create-react-app
RUN npm install --save redux
RUN npm install --save react-redux
RUN npm install @material-ui/core
RUN npm install --save react-addons-css-transition-group
RUN npm install --save react-router-dom
RUN npm install --save react-router-redux
RUN npm install --save history@4.7.2
RUN npm install --save connected-react-router
RUN npm install --save react-router
RUN npm install --save redux-logger
RUN npm install --save redux-thunk
RUN npm install react-pose --save
RUN npm install --save prop-types
RUN npm install --save fetch-jsonp
RUN npm install --save qs
RUN npm install --save redux-mock-store jest-fetch-mock
RUN npm install --save isomorphic-fetch
RUN npm install --save enzyme enzyme-adapter-react-16 react-test-renderer
RUN npm remove react
RUN npm remove react-dom
RUN npm install --save react@16.14.0
RUN npm install --save react-dom@16.14.0
RUN npm install --save react-test-renderer
RUN npm install --save node-fetch fetch-json
RUN npm install --save @material-ui/icons
RUN npm install --save react-webcam