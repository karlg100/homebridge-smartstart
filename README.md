
# Smartstart Plugin

## Example config.json:

### One vehicle
 ```
    "accessories": [
        {
            "accessory": "SmartStart",
            "name": "Civic",
            "username": "[username]",
            "password": "[password]",
            "delay": 900000
        }
    ]

```

### Or multiple vehicles
 ```
    "accessories": [
        {
            "accessory": "SmartStart",
            "name": "Odyssey",
            "username": "[username]",
            "password": "[password]",
            "deviceIndex": 0,
            "delay": 900000
        },
        {
            "accessory": "SmartStart",
            "name": "Ridgeline",
            "username": "[username]",
            "password": "[password]",
            "deviceIndex": 1,
            "delay": 900000
        }
    ]

```



## What does this do?

This plugin enables your SmartStart vehicle to be controlled by HomeKit (and Siri) via homebridge.  Install using the standard homebridge instructions, and add this plugin.

* name - give your vehicle a name.  Can be anything you like
* username - your username you use to login to the app on your phone to control your vehicle
* password - the password to the same account
* deviceIndex - if you have one vehicle, use 0. For second vehicle use 1, third use 2, and so on.
* delay - the default is a 15 min runtime.  This will turn the switch state to the off position after 15 mins, unless you turn it off manually (and stop the car)

## This is a as simple as it gets implementation

Using the SmartStart npm module, this will just send a "remote" action to your vehicle.  There is no state information at this time that's accessible.  (somehow the app is able to retrieve the status of the vehicle, but it costs an "action" which accounts are limited to a number per year, and the API is not strait forward)

Locking/unlocking is also not implemented.

## How to install

 ```sudo npm install -g homebridge-smartstart```

## Pro-tip
If you have multiple vehicles, and once they are all working and tested via HomeKit, create a room called Vehicles.  (or cars, or whatever you'd like to call the group)  You can then tell Siri "start vehicles" and it will kick a smartstart action to all of them at the same time.  If you have HomeKit sharing setup, your other family members will be able to also see if the vehicles have been started.
 
## Todo
* implement status syncing with cloud.  Should be done in a way that keeps the 5000 actions/year in mind so you don't blow out annual subscriptions
* implement lock/arm and unlock/disarm commands
* maybe turn into a platform and auto-discover all devices

## Credits
This plugin was forked from and inspired by homebridge-delay-switch, homebridge-simple-switch-example and the alexa-smartstart and smartstart npm by @dale3h.  Without these last two modules, this homebridge module wouldn't exist.
