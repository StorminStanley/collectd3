/*global describe:true, it:true, beforeEach:true*/
'use strict';

var expect = require('expect.js');

describe('RRD Helpers', function () {
  var rrdhelpers = require('../lib/rrdhelpers.js');

  describe('Fetch', function () {
    var thats = rrdhelpers.fetch('localhost', 'load/load.rrd', 'AVERAGE', {
      from: 1370641940,
      to: 1370643140,
      resolution: 500
    }),
    from = thats;
    
    it('should not produce an error', function (ok) {
      thats(ok);
    });
    
    it('should return non empty object', function (ok) {
      from(function (err, data) {
        expect(data).to.be.an('array');
        expect(data).not.to.be.empty();
        ok();
      });
    });
    
    it('should have certain structure', function (ok) {
      from(function (err, data) {
        expect(data).to.have.length(3);
        expect(data[1]).to.only.have.keys('shortterm', 'midterm', 'longterm', '_time');
        ok();
      });
    });
    
    it('should return correct values', function (ok) {
      from(function (err, data) {
        expect(data[1]._time).to.be(1370642500);
        expect(data[1].shortterm).to.be(1.8036400000000004);
        ok();
      });
    });
    
  });
  
  describe('Extract', function () {
    var thats = rrdhelpers.extract('localhost', 'load/load.rrd', {
      shortterm: 'ds[shortterm].value',
      last_update: 'last_update'
    }),
    from = thats;
    
    it('should not produce an error', function (ok) {
      thats(ok);
    });
    
    it('should return non empty object', function (ok) {
      from(function (err, data) {
        expect(data).to.be.an('object');
        expect(data).not.to.be.empty();
        ok();
      });
    });
    
    it('should have certain structure', function (ok) {
      from(function (err, data) {
        expect(data).to.have.property('shortterm');
        expect(data).to.have.property('last_update');
        ok();
      });
    });
    
    it('should return correct values', function (ok) {
      from(function (err, data) {
        expect(data.shortterm).to.be(4.38);
        expect(data.last_update).to.be(1370643146);
        ok();
      });
    });
    
  });
  
  describe('ExtractAll', function () {
    var thats = rrdhelpers.extractAll('load/load.rrd', {
      shortterm: 'ds[shortterm].value',
      last_update: 'last_update'
    }),
    from = thats;
    
    it('should not produce an error', function (ok) {
      thats(ok);
    });
    
    it('should return non empty object', function (ok) {
      from(function (err, data) {
        expect(data).to.be.an('object');
        expect(data).not.to.be.empty();
        ok();
      });
    });
    
    it('should have certain structure', function (ok) {
      from(function (err, data) {
        expect(data).to.have.property('localhost');
        expect(data.localhost).to.have.property('shortterm');
        expect(data.localhost).to.have.property('last_update');
        ok();
      });
    });
    
    it('should return correct values', function (ok) {
      from(function (err, data) {
        expect(data.localhost.shortterm).to.be(4.38);
        expect(data.localhost.last_update).to.be(1370643146);
        ok();
      });
    });
    
  });
  
  describe('NormalizeLoad', function () {
    var thats = rrdhelpers.normalizeLoad(['shortterm', 'midterm', 'longterm'], 'localhost'),
        from = thats,
        data;
    
    beforeEach(function () {
      data = { shortterm: 1, midterm: 2, longterm: 3};
    });
    
    it('should not produce an error', function (ok) {
      thats(data, ok);
    });
    
    it('should return non empty object', function (ok) {
      from(data, function (err, data) {
        expect(data).to.be.an('object');
        expect(data).not.to.be.empty();
        ok();
      });
    });
    
    it('should have certain structure', function (ok) {
      from(data, function (err, data) {
        expect(data).to.have.property('shortterm');
        expect(data).to.have.property('midterm');
        expect(data).to.have.property('longterm');
        ok();
      });
    });
    
    it('should return correct values', function (ok) {
      from(data, function (err, data) {
        expect(data.shortterm).to.be(0.5);
        expect(data.midterm).to.be(1);
        expect(data.longterm).to.be(1.5);
        ok();
      });
    });
    
  });

});
