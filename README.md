# Showing stats with collectd + d3js
Collectd3 is a modern visualization of [collectd](http://collectd.org/) system performance statistics. It does more than just visualizes the data. It generates a bird-eye view of multy-server system and enables to quickly spot the problems and dig down for details.

It integrates with other graphical tools,like [Collectd Graph Panel](https://collectd.org/wiki/index.php/Collectd_Graph_Panel) 



## Pre-requisites: 

* [nodejs](http://nodejs.org/) 0.8 or later 
* [npm 1.2.x](https://npmjs.org)
* rrdtool - [http://oss.oetiker.ch/rrdtool](http://oss.oetiker.ch/rrdtool)
* librrd-dev - required for node_rrd, to build node bindings (on Ubuntu, apt-get install librrd-dev)
* access to your collectd data

## Install dependencies



1. Install [rrdtool](http://oss.oetiker.ch/rrdtool). On Mac, [homebrew](http://mxcl.github.io/homebrew/) works fine. On Linux - install rrdtool and librrd-dev. E.g.,  ```apt-get install rrdtool, apt-get install librrd-dev```. On Windows, figure this out yourself (and add instructions here). Make sure rrdtool is on the path and working (try ```$ which rrdtool```, ```$ rrdtool```). 

2. Get node dependencies: 

		$ npm install

## Unit tests

Run node unit tests:

* by npm (a script is configured in package.json)

		$ npm test

* or manually 

		env NODE_ENV=test node_modules/.bin/mocha -R spec

Browser unit tests - not implemented yet.

## Configure
Open `config/default.yml`. Modify data-directory to point out to collectd files. Change the port of web app. Define and adjust host categoreis (use regular expressions). Adjust storage partitions, disks, etc. See comments in default.yml

Configs are read and extend each other sequentially in a specific order: default.yml, ```NODE_ENV```.yml (like test.yml for NODE_ENV=test), ```HOSTNAME```.yml (like collectd.yml for collectd.example.com). 

If you want specific section to be handled as-is and prevent it from being overriden or extended by any other config file loaded later, you should add ```~override: true``` to it.

For more info, see comments in default.yml and [YAML documentation](http://www.yaml.org/spec/1.2/spec.html)

## Sample data
When developing, testing, or trying this out, work with sample data.
* Download the sampledata(https://s3-us-west-1.amazonaws.com/stackstorm/collectd3-sampledata/sampledata.zip), unzip and place under collectd3 (or place anywhere and adjust the data-ditectory in config)
* In config, uncomment ```last-timestamp: 1370643660``` in the server section

## Run server

		$ npm start

## Developing
Always use grunt. It will watch for changes and recompile, lint and unit-test each file you change. If you use ```npm start```, you need to do it manually (except for less files, they would be recompiled before each start).

Run grunt:

* by first installing grunt-cli globally (```npm install grunt-cli -g```)

		$ grunt

* by using ```grunt-cli``` which already installed locally

		$ node_modules/.bin/grunt
		
## Copyright and license
<br>Copyright 2013 StackStorm, Inc.

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this work except in compliance with the License. You may obtain a copy of the License in the LICENSE file, or at:

[http://www.apache.org/licenses/LICENSE-2.0](http://www.apache.org/licenses/LICENSE-2.0)

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.



