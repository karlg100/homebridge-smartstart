"use strict";

var Service, Characteristic;

module.exports = function(homebridge) {
 
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  
  homebridge.registerAccessory("homebridge-smartstart", "SmartStart", SmartStart);
}

function SmartStart(log, config) {
  this.log = log;
  this.name = config.name;
  this.delayTime = config.delay;
  this.Timer;
  this._service = new Service.Switch(this.name);
  this._service.getCharacteristic(Characteristic.On)
    .on('set', this._setOn.bind(this));
}

SmartStart.prototype.getServices = function() {
  return [this._service];
}

SmartStart.prototype._setOn = function(on, callback) {
 this.log("Smart starting " + on);
 if (on) {
    clearTimeout(this.Timer);
    this.Timer = setTimeout(function() {
      this._service.setCharacteristic(Characteristic.On, false);
    }.bind(this), this.delayTime);
  }
  else { 
   clearTimeout(this.Timer);
  }
  
  callback();
}
