/*global describe:true, it:true*/
'use strict';

var expect = require('expect.js');

describe('Aggregate Info', function () {
  var aggregate = require('../lib/aggregate.js'),
      res = function (callback) {
        return { json: callback };
      },
      req = null;

  describe('Interface callback', function () {

    it('should be a function', function () {
      expect(aggregate).to.be.a('function');
    });

    it('should return non empty object', function (next) {
      var expected = function (data) {
        expect(data).to.be.an('object');
        expect(data).not.to.be.empty();
        next();
      };
      aggregate(req, res(expected), next);
    });

    describe('load', function () {
      it('should have certain structure', function (next) {
        var expected = function (data) {
          expect(data).to.have.property('load');
          expect(data.load).to.have.property('average');
          expect(data.load).to.have.property('peak');
          expect(data.load.average).to.be.a('number');
          expect(data.load.peak).to.be.a('number');
          next();
        };
        aggregate(req, res(expected), next);
      });

      it('should return correct values', function (next) {
        var expected = function (data) {
          expect(data.load.average).to.be(0.6083333333333333);
          expect(data.load.peak).to.be(0.73);
          next();
        };
        aggregate(req, res(expected), next);
      });

    });
    
    describe('memory', function () {
      it('should have certain structure', function (next) {
        var expected = function (data) {
          expect(data).to.have.property('memory');
          expect(data.memory).to.have.property('allocated');
          expect(data.memory).to.have.property('committed');
          expect(data.memory.allocated).to.be.a('number');
          expect(data.memory.committed).to.be.a('number');
          next();
        };
        aggregate(req, res(expected), next);
      });

      it('should return correct values', function (next) {
        var expected = function (data) {
          expect(data.memory.allocated).to.be(28);
          expect(data.memory.committed).to.be(20.000660230483472);
          next();
        };
        aggregate(req, res(expected), next);
      });

    });

    describe('storage', function () {
      it('should have certain structure', function (next) {
        var expected = function (data) {
          expect(data).to.have.property('storage');
          expect(data.storage).to.have.property('average');
          expect(data.storage).to.have.property('peak');
          expect(data.storage.average).to.be.a('number');
          expect(data.storage.peak).to.be.a('number');
          next();
        };
        aggregate(req, res(expected), next);
      });

      it('should return correct values', function (next) {
        var expected = function (data) {
          expect(data.storage.average).to.be(0);
          expect(data.storage.peak).to.be(0);
          next();
        };
        aggregate(req, res(expected), next);
      });

    });

    describe('network', function () {
      it('should have certain structure', function (next) {
        var expected = function (data) {
          expect(data).to.have.property('network');
          expect(data.network).to.have.property('average');
          expect(data.network).to.have.property('peak');
          expect(data.network).to.have.property('errors');
          expect(data.network.average).to.be.a('number');
          expect(data.network.peak).to.be.a('number');
          expect(data.network.errors).to.be.a('boolean');
          next();
        };
        aggregate(req, res(expected), next);
      });

      it('should return correct values', function (next) {
        var expected = function (data) {
          expect(data.network.average).to.be(1156229.0346413667);
          expect(data.network.peak).to.be(60239162.300000004);
          expect(data.network.errors).to.be(false);
          next();
        };
        aggregate(req, res(expected), next);
      });

    });

  });

});