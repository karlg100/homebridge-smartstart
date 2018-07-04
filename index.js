'use strict'

let Service, Characteristic
var SmartStartLib = require('smartstart');


module.exports = (homebridge) => {
  /* this is the starting point for the plugin where we register the accessory */
  Service = homebridge.hap.Service
  Characteristic = homebridge.hap.Characteristic
  homebridge.registerAccessory('homebridge-smartstart', 'SmartStart', SmartStart)
}

class SmartStart {
  constructor (log, config) {
    // get config values
    this.log = log;
    this.name = config['name'];
    this.service = new Service.Switch(this.name);
    this.delay = config['delay'];
    this.timer;

    // define SmartStart vehicle
    this.vehicle = new SmartStartLib({
      username: config['username'],
      password: config['password'],
      deviceIndex: config['deviceIndex']
    });

    this.log(config['username']);

    this.service = new Service.Switch(this.name);
  }

  getServices () {
    /*
     * The getServices function is called by Homebridge and should return an array of Services this accessory is exposing.
     * It is also where we bootstrap the plugin to tell Homebridge which function to use for which action.
     */

     /* Create a new information service. This just tells HomeKit about our accessory. */
    const informationService = new Service.AccessoryInformation()
        .setCharacteristic(Characteristic.Manufacturer, 'oznu')
        .setCharacteristic(Characteristic.Model, 'SwitchExample')
        .setCharacteristic(Characteristic.SerialNumber, 'oznu-switch-example')

    /*
     * For each of the service characteristics we need to register setters and getter functions
     * 'get' is called when HomeKit wants to retrieve the current state of the characteristic
     * 'set' is called when HomeKit wants to update the value of the characteristic
     */
    this.service.getCharacteristic(Characteristic.On)
      .on('get', this.getOnCharacteristicHandler.bind(this))
      .on('set', this.setOnCharacteristicHandler.bind(this))

    /* Return both the main service (this.service) and the informationService */
    return [informationService, this.service]
  }

  actionCallback(err, result) {
    if(err) return console.error(err);
    console.log(result);
  }

  setOnCharacteristicHandler (value, callback) {
    /* this is called when HomeKit wants to update the value of the characteristic as defined in our getServices() function */

    /*
     * The desired value is available in the `value` argument.
     * This is just an example so we will just assign the value to a variable which we can retrieve in our get handler
     */
    this.isOn = value

    if (!value) {
      clearTimeout(this.timer);
    } else {

      this.timer = setTimeout(function() {
        this.log('Time is Up!');
        this.service.getCharacteristic(Characteristic.On).updateValue(false);
        this.isOn = false;
      }.bind(this), this.delay);

    }

    /* Log to the console the value whenever this function is called */
    this.log(`calling setOnCharacteristicHandler`, value)

    this.vehicle.remote(this.actionCallback);
    /*
     * The callback function should be called to return the value
     * The first argument in the function should be null unless and error occured
     */
    callback(null)
  }

  getOnCharacteristicHandler (callback) {
    /*
     * this is called when HomeKit wants to retrieve the current state of the characteristic as defined in our getServices() function
     * it's called each time you open the Home app or when you open control center
     */

    /* Log to the console the value whenever this function is called */
    this.log(`calling getOnCharacteristicHandler`, this.isOn)

    /*
     * The callback function should be called to return the value
     * The first argument in the function should be null unless and error occured
     * The second argument in the function should be the current value of the characteristic
     * This is just an example so we will return the value from `this.isOn` which is where we stored the value in the set handler
     */
    callback(null, this.isOn)
  }

}
