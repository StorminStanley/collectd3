/*global describe:true, it:true*/
'use strict';

var expect = require('expect.js');

describe('Host Info', function () {
  var hostInfo = require('../lib/hostinfo.js'),
      res = function (callback) {
        return { json: callback };
      },
      req = { params: { id: 'localhost' }, query: {} };

  describe('Interface callback', function () {

    it('should be a function', function () {
      expect(hostInfo).to.be.a('function');
    });

    it('should return non empty object', function (next) {
      var expected = function (data) {
        expect(data).to.be.an('object');
        expect(data).not.to.be.empty();
        next();
      };
      hostInfo(req, res(expected), next);
    });

    describe('load', function () {
      it('should have certain structure', function (next) {
        var expected = function (data) {
          expect(data).to.have.property('load');
          expect(data.load).to.be.an('object');
          expect(data.load).to.only.have.keys('shortterm', 'midterm', 'longterm', '_time');
          next();
        };
        hostInfo(req, res(expected), next);
      });

      it('should return correct values', function (next) {
        var expected = function (data) {
          expect(data.load.shortterm).to.be(0.49000000000000005);
          expect(data.load.midterm).to.be(0.49499999999999994);
          expect(data.load.longterm).to.be(0.575);
          expect(data.load._time).to.be(1370643000);
          next();
        };
        hostInfo(req, res(expected), next);
      });

    });
    
    describe('memory', function () {
      it('should have certain structure', function (next) {
        var expected = function (data) {
          expect(data).to.have.property('memory');
          expect(data.memory).to.be.an('object');
          expect(data.memory).to.only.have.keys('used', 'free', 'cached', 'buffered');
          next();
        };
        hostInfo(req, res(expected), next);
      });

      it('should return correct values', function (next) {
        var expected = function (data) {
          expect(data.memory.used.value).to.be(20272826777.6);
          expect(data.memory.free.value).to.be(19365131878.4);
          expect(data.memory.cached.value).to.be(61303603200);
          expect(data.memory.buffered.value).to.be(434384896);
          next();
        };
        hostInfo(req, res(expected), next);
      });

    });
    
    describe('storage', function () {
      it('should have certain structure', function (next) {
        var expected = function (data) {
          expect(data).to.have.property('storage');
          expect(data.storage).to.be.an('array');
          expect(data.storage[0]).to.only.have.keys('name', 'used', 'free', '_time');
          next();
        };
        hostInfo(req, res(expected), next);
      });

      it('should return correct values', function (next) {
        var expected = function (data) {
          expect(data.storage[0].name).to.be('root');
          expect(data.storage[0].used).to.be(10775152640);
          expect(data.storage[0].free).to.be(31466010624);
          expect(data.storage[0]._time).to.be(1370643000);
          next();
        };
        hostInfo(req, res(expected), next);
      });

    });
    
    describe('vcpu', function () {
      it('should have certain structure', function (next) {
        var expected = function (data) {
          expect(data).to.have.property('vcpu');
          expect(data.vcpu).to.be.an('array');
          expect(data.vcpu).to.have.length(2);
          expect(data.vcpu[1]).to.only.have.keys('used', 'wait', '_id');
          next();
        };
        hostInfo(req, res(expected), next);
      });

      it('should return correct values', function (next) {
        var expected = function (data) {
          expect(data.vcpu[0].used).to.be(0.19885894200924448);
          expect(data.vcpu[0].wait).to.be(0.09075988656409797);
          expect(data.vcpu[1].used).to.be(0.19885894200924448);
          expect(data.vcpu[1].wait).to.be(0.09075988656409797);
          next();
        };
        hostInfo(req, res(expected), next);
      });

    });
    
    describe('storage IO', function () {
      it('should have certain structure', function (next) {
        var expected = function (data) {
          expect(data).to.have.property('storageio');
          expect(data.storageio).to.only.have.keys('average', 'peak');
          next();
        };
        hostInfo(req, res(expected), next);
      });

      it('should return correct values', function (next) {
        var expected = function (data) {
          expect(data.storageio.average).to.be(0);
          expect(data.storageio.peak).to.be(0);
          next();
        };
        hostInfo(req, res(expected), next);
      });

    });
    
    describe('network IO', function () {
      it('should have certain structure', function (next) {
        var expected = function (data) {
          expect(data).to.have.property('networkio');
          expect(data.networkio).to.only.have.keys('average', 'peak', 'errors');
          next();
        };
        hostInfo(req, res(expected), next);
      });

      it('should return correct values', function (next) {
        var expected = function (data) {
          expect(data.networkio.average).to.be(3468687.1039241);
          expect(data.networkio.peak).to.be(60239162.300000004);
          expect(data.networkio.errors).to.be(0);
          next();
        };
        hostInfo(req, res(expected), next);
      });

    });

  });

});