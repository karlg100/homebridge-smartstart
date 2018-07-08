'use strict'

let Service, Characteristic
var SmartStartLib = require('smartstart');


module.exports = (homebridge) => {
  Service = homebridge.hap.Service
  Characteristic = homebridge.hap.Characteristic
  homebridge.registerAccessory('homebridge-smartstart', 'SmartStart', SmartStart)
  homebridge.registerAccessory('homebridge-smartstart', 'SmartStartLock', SmartStartLock)
}

class SmartStart {
  constructor (log, config) {
    // get config values
    this.log = log;
    this.name = config['name'];
    this.startService = new Service.Switch(this.name);
    this.startDelay = config['delay'];
    this.deviceIndex = config['deviceIndex'];
    this.startTimer;

    // define SmartStart vehicle
    this.vehicle = new SmartStartLib({
      username: config['username'],
      password: config['password'],
      deviceIndex: config['deviceIndex']
    });

    this.vehicle.getDeviceId(this.deviceIndex, this.infoCallback.bind(this));
  }

  getServices () {

    var informationService = new Service.AccessoryInformation()
        .setCharacteristic(Characteristic.Manufacturer, 'SmartStart')
        .setCharacteristic(Characteristic.Model, 'SmartStart')
        .setCharacteristic(Characteristic.SerialNumber, '')


    this.startService.getCharacteristic(Characteristic.On)
      .on('get', this.getOnCharacteristicHandler.bind(this))
      .on('set', this.setOnCharacteristicHandler.bind(this))

    return [informationService, this.startService]
  }

  infoCallback(err, result) {
    //this.log(this.vehicle);
  }

  actionCallback(err, result) {
    if(err) return console.error(err);
    console.log(result);
  }

  setOnCharacteristicHandler (value, callback) {

    if (this.isOn == value) {
      this.log(`vehicle aready in the called state via homebridge  :`+this.name, value)
    } else {
      this.log(`starting/stopping `+this.name, value)
      this.vehicle.remote(this.actionCallback);
      this.isOn = value
    }

    if (!value) {
      clearTimeout(this.smartTimer);
    } else {
      this.smartTimer = setTimeout(function() {
        this.log('Time is Up!');
        this.startService.getCharacteristic(Characteristic.On).updateValue(false);
        this.isOn = false;
      }.bind(this), this.startDelay);
    }
    callback(null)
  }

  getOnCharacteristicHandler (callback) {

    this.log(`updating vehcile status`, this.isOn)
    /*
	if the SmartStart API can be figured out, add timer based updates to poll the vehicles, then return those cached values here
     */
    callback(null, this.isOn)
  }
}

class SmartStartLock {
  constructor (log, config) {
    // get config values
    this.log = log;
    this.name = config['name'];
    this.lockService = new Service.LockMechanism(this.name);
    this.lockState = Characteristic.LockCurrentState.SECURED;

    // define SmartStart vehicle
    this.vehicle = new SmartStartLib({
      username: config['username'],
      password: config['password'],
      deviceIndex: config['deviceIndex']
    });
  }

  getServices () {
    const informationService = new Service.AccessoryInformation()
        .setCharacteristic(Characteristic.Manufacturer, 'SmartStart')
        .setCharacteristic(Characteristic.Model, 'SmartStart')
        .setCharacteristic(Characteristic.SerialNumber, '');

    this.lockService.getCharacteristic(Characteristic.LockCurrentState)
      .on('get', this.getLockCharacteristicHandler.bind(this));

    this.lockService.getCharacteristic(Characteristic.LockTargetState)
      .on('get', this.getLockCharacteristicHandler.bind(this))
      .on('set', this.setLockCharacteristicHandler.bind(this));

    return [informationService, this.lockService]
  }

  actionCallback(err, result) {
    if(err) {
      this.updateCurrentState(Characteristic.LockCurrentState.JAMMED);
      return console.error(err);
    }
    this.updateCurrentState(this.lockState);
    //this.log(this);
    this.log(this.lockState+" "+this.name);
    //this.log(result);
  }

  // Lock Handler
  setLockCharacteristicHandler (targetState, callback) {
    var lockh = this;

    if (targetState == Characteristic.LockCurrentState.SECURED) {
      this.log(`locking/arming `+this.name, targetState)
      this.lockState = targetState
      this.vehicle.arm(this.actionCallback.bind(this));
    } else {
      this.log(`unlocking/disarming `+this.name, targetState)
      this.lockState = targetState
      this.vehicle.disarm(this.actionCallback.bind(this));
    }
    callback();
  }

  updateCurrentState(toState) {
    this.lockService
      .getCharacteristic(Characteristic.LockCurrentState)
      .updateValue(toState);
  }

  getLockCharacteristicHandler (callback) {
    /*
	if the SmartStart API can be figured out, add timer based updates to poll the vehicles, then return those cached values here
     */
    callback(null, this.lockState)
  }

}
