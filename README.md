# Showing stats with collectd + d3js

## Install dependencies

1. Install [rrdtool](http://oss.oetiker.ch/rrdtool). On Mac, [homebrew](http://mxcl.github.io/homebrew/) works. On Linux, use apt-get rrdtool. On Windows, figure this out yourself (and add instructions here). Make sure rrdtool is on the path (try ```$ which rrdtool```, ```$ rrdtool```).

2. Get node dependencies: 

		$ npm install

## Unit tests

Node unit tests:

* by npm (a script is configured in package.json)

		$ npm test

* or manually 

		env NODE_ENV=test node_modules/.bin/mocha -R spec

Browser unit tests - not implemented yet.

## Configure
Open `config/default.yml`. Modify data-directory to point out to collectd files. Change the port of web app. Define and adjust host categoreis (use regular expressions).

Configs are read and extend each other sequentially in a specific order: default.yml, ```NODE_ENV```.yml (like test.yml for NODE_ENV=test), ```HOSTNAME```.yml (like collectd.yml for collectd.example.com).

If you want specific section to be handled as-is and prevent it from being overriden or extended by any other config file loaded later, you should add ```~override: true``` to it.

For more info, see comments in default.yml and [YAML documentation](http://www.yaml.org/spec/1.2/spec.html)

## Run server

You can start server:

* by ```npm start```

		$ npm start

* by first installing grunt-cli globally (```npm install grunt-cli -g```)

		$ grunt

* by using ```grunt-cli``` which already installed locally

		$ node_modules/.bin/grunt

If you use grunt, it will watch for changes and recompile, lint and unit-test each file you change. If you use ```npm start```, you need to do it manually (except for less files, they would be recompiled before each start).
