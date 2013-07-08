/*global describe:true, it:true*/
'use strict';

var expect = require('expect.js');

describe('Host Graph', function () {
  var hostGraph = require('../lib/hostgraph.js'),
      res = function (callback) {
        return { json: callback };
      },
      req = { params: { id: 'localhost' }, query: { period: 'day' }};

  describe('Interface callback', function () {

    it('should be a function', function () {
      expect(hostGraph).to.be.a('function');
    });

    it('should return non empty object', function (next) {
      var expected = function (data) {
        expect(data).to.be.an('object');
        expect(data).not.to.be.empty();
        next();
      };
      hostGraph(req, res(expected), next);
    });

    describe('load', function () {
      it('should have certain structure', function (next) {
        var expected = function (data) {
          expect(data).to.have.property('load');
          expect(data.load).to.have.length(173);
          expect(data.load[1]).to.have.length(2);
          next();
        };
        hostGraph(req, res(expected), next);
      });

      it('should return correct values', function (next) {
        var expected = function (data) {
          expect(data.load[1][0]).to.be(1370558000);
          expect(data.load[1][1]).to.be(2.072);
          next();
        };
        hostGraph(req, res(expected), next);
      });

    });
    
    describe('memory', function () {
      it('should have certain structure', function (next) {
        var expected = function (data) {
          expect(data).to.have.property('memory');
          expect(data.memory).to.have.length(173);
          expect(data.memory[1]).to.have.length(5);
          next();
        };
        hostGraph(req, res(expected), next);
      });

      it('should return correct values', function (next) {
        var expected = function (data) {
          expect(data.memory[1][0]).to.be(1370558000);
          expect(data.memory[1][1]).to.be(20.628898302047595);
          next();
        };
        hostGraph(req, res(expected), next);
      });

    });
    
    describe('storage', function () {
      it('should have certain structure', function (next) {
        var expected = function (data) {
          expect(data).to.have.property('storage');
          expect(data.storage).to.have.length(173);
          expect(data.storage[1]).to.have.length(2);
          next();
        };
        hostGraph(req, res(expected), next);
      });

      it('should return correct values', function (next) {
        var expected = function (data) {
          expect(data.storage[1][0]).to.be(1370558000);
          expect(data.storage[1][1]).to.be(0);
          next();
        };
        hostGraph(req, res(expected), next);
      });

    });
    
    describe('network', function () {
      it('should have certain structure', function (next) {
        var expected = function (data) {
          expect(data).to.have.property('network');
          expect(data.network).to.have.length(173);
          expect(data.network[1]).to.have.length(3);
          next();
        };
        hostGraph(req, res(expected), next);
      });

      it('should return correct values', function (next) {
        var expected = function (data) {
          expect(data.network[1][0]).to.be(1370558000);
          expect(data.network[1][1]).to.be(1115834.2532);
          expect(data.network[1][2]).to.be(0);
          next();
        };
        hostGraph(req, res(expected), next);
      });

    });

  });

});