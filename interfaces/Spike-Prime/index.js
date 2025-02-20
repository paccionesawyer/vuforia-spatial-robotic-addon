// ************** CHANGE THIS ************** //

var TOOL_NAME = "Spike1"; // This is what is made on the webserver for the image target
let objectName = "spikeNode"; // This is the name of the folder in spatialToolbox in Documents 
var complexity = "Spike1";// This will make sure the complexity level for each can be different

///////////////////////////////////////////////

// Variables
const fetch = require("node-fetch");
var serial = require('./serial.js');
var server = require('@libraries/hardwareInterfaces');
var settings = server.loadHardwareInterface(__dirname);

var colors = ["black", "violet", "blue", "cyan", "green", "yellow", "red", "white"]
var portLetters = ["A", "B", "C", "D", "E", "F"]
var ports = ["none", "none", "none", "none", "none", "none"]
var sensorData, arr
var distance, color, accel, accelArr
var [motor1, motor2, motor3, distanceSensor, colorSensor, forceSensor] = ports
var firstMotor, secondMotor, thirdMotor
var runMotors = true
var sensorRefresh = 50
// var oldArr = [], oldFullArr = []
// var fullFFT = [], fullArr = []
// var oldFs = 0
// var FFTAxis = 0, FFTLength = 16, maxMag = 0, maxMagIndex = 0
 

exports.enabled = settings('enabled');
exports.configurable = true;

// Send the initialize file to the Spike Prime, which determines motor/sensor ports
try {
    serial.openPort()
    setTimeout(() => {serial.sendFile('./addons/vuforia-spatial-robotic-addon/interfaces/Spike-Prime/initialize.py')}, 5000) // CHANGED HERE --> Reverted the times back to original
    setTimeout(() => {serial.sendFile('./addons/vuforia-spatial-robotic-addon/interfaces/Spike-Prime/functions.py')}, 6500) // CHANGED HERE --> Reverted the times back to original
    setTimeout(() => {initializePorts()}, 8000) // CHANGED HERE --> Reverted the times back to original
} catch(e) {
    console.log('Spike Prime NOT connected')
}

if (exports.enabled){
    // Code executed when your robotic addon is enabled
    setup();
    console.log('Spike: Settings loaded: ', objectName)
    console.log("Spike is connected");

    // Sets up the settings that can be customized on localhost:8080
    function setup() {
        exports.settings = {
            // Name for the object
            spikeName: { // CHANGED HERE --> Name is changed here 
                value: settings('objectName', objectName),
                type: 'text',
                default: objectName,
                disabled: false,
                helpText: 'The name of the object that connects to this hardware interface.'
            },
            // Complexity level for the object
            spikeComplexity: { // CHANGED HERE --> Name is changed here 
                value: settings('spikeComplexity', 'intermediate'), 
                type: 'text',
                default: 'intermediate',
                disabled: false,
                helpText: 'The complexity of the interface. "beginner" gives a few nodes, "intermediate" \
                gives more, and "advanced" gives full control. If you want super accurate sensor data, \
                you can use the complexity "sensor" to get faster sensor data in exchange for no motor control.'
            },
            // // activity the user wants loaded in
            // activity: { // CHANGED HERE --> Name is changed here 
            //     value: settings('activity', 'none'),
            //     type: 'text',
            //     default: 'none',
            //     disabled: false,
            //     helpText: 'The activity you want to load into the interface. "none" will not load an activity \
            //     "fft" will load the Fast Fourier Transform (FFT) activity.'
            // }
        };
    }

    // Get the settings that the user defined on localhost:8080
    objectName = exports.settings.spikeName.value;
    complexity = exports.settings.spikeComplexity.value.toLowerCase();
    complexity = complexity.replace(/\n/g,'');
    // activity = exports.settings.activity.value.toLowerCase();
    // activity = activity.replace(/\n/g,'');
    console.log("with complexity: " + complexity)
    // console.log("with activity: " + activity)

    server.addEventListener('reset', function () {
        settings = server.loadHardwareInterface(__dirname);
        setup();

        console.log('Spike: Settings loaded: ', objectName);
    });
}

// Starts the interface with the hardware
function startHardwareInterface() {
    console.log('Spike: Starting up')

    server.enableDeveloperUI(true)

    // Adds sensor nodes to the object on the app
    server.addNode(objectName, TOOL_NAME, "stopMotors", "node", {x: 0, y: 125, scale:0.175});
    server.addNode(objectName, TOOL_NAME, "color", "node", {x: 75, y: -175, scale:0.175});
    server.addNode(objectName, TOOL_NAME, "distance", "node", {x: 0, y: -175, scale:0.175});
    server.addNode(objectName, TOOL_NAME, "force", "node", {x: -75, y: -175, scale:0.175});
    server.addNode(objectName, TOOL_NAME, "accelerometerX", "node", {x: -125, y: -100, scale:0.175});
    server.addNode(objectName, TOOL_NAME, "accelerometerY", "node", {x: -125, y: -25, scale:0.175});
    server.addNode(objectName, TOOL_NAME, "accelerometerZ", "node", {x: -125, y: 50, scale:0.175});
    server.addNode(objectName, TOOL_NAME, "gyroscopeX", "node", {x: -200, y: -100, scale:0.175});
    server.addNode(objectName, TOOL_NAME, "gyroscopeY", "node", {x: -200, y: -25, scale:0.175});
    server.addNode(objectName, TOOL_NAME, "gyroscopeZ", "node", {x: -200, y: 50, scale:0.175});

    // Adds motor nodes to the object on the app
    server.addNode(objectName, TOOL_NAME, "motor1", "node", {x: 125, y: -100, scale:0.175});
    server.addNode(objectName, TOOL_NAME, "motor2", "node", {x: 125, y: -25, scale:0.175});
    server.addNode(objectName, TOOL_NAME, "motor3", "node", {x: 125, y: 50, scale:0.175});

    // Removes nodes that are only found in beginner (otherwise they will stay spawned in when switching)
    server.removeNode(objectName, TOOL_NAME, "LED")
    server.removeNode(objectName, TOOL_NAME, "screen")
    server.removeNode(objectName, TOOL_NAME, "motors")  

    // // Removes FFT nodes
    // server.removeNode(objectName, TOOL_NAME, "FFTStart")
    // server.removeNode(objectName, TOOL_NAME, "FFTLength")
    // server.removeNode(objectName, TOOL_NAME, "FFTAxis")
    // server.removeNode(objectName, TOOL_NAME, "FFTOutput")

    if (complexity == 'beginner' || complexity == 'intermediate') {
        // Remove the accelerometer/gyroscope/FFT nodes
        server.removeNode(objectName, TOOL_NAME, "accelerometerX")
        server.removeNode(objectName, TOOL_NAME, "accelerometerY")
        server.removeNode(objectName, TOOL_NAME, "accelerometerZ")
        server.removeNode(objectName, TOOL_NAME, "gyroscopeX")
        server.removeNode(objectName, TOOL_NAME, "gyroscopeY")
        server.removeNode(objectName, TOOL_NAME, "gyroscopeZ")

        // Removing more nodes for beginner
        if (complexity == 'beginner') {
            server.removeNode(objectName, TOOL_NAME, "color")
            server.removeNode(objectName, TOOL_NAME, "force")
            server.removeNode(objectName, TOOL_NAME, "motor1")
            server.removeNode(objectName, TOOL_NAME, "motor2")
            server.removeNode(objectName, TOOL_NAME, "motor3")

            // Adding LED and Screen nodes and moving the distance node
            server.addNode(objectName, TOOL_NAME, "screen", "node", {x: -125, y: -25, scale:0.175});
            server.addNode(objectName, TOOL_NAME, "LED", "node", {x: -125, y: 50, scale:0.175});
            server.addNode(objectName, TOOL_NAME, "motors", "node", {x: 125, y: -25, scale:0.175});
            server.moveNode(objectName, TOOL_NAME, "distance", 125, 50)

            // Increases the sensor refresh rate due to more things being sent
            sensorRefresh = 100
        }
        // Moving nodes for intermediate
        else {
            server.moveNode(objectName, TOOL_NAME, "color", -125, -100)
            server.moveNode(objectName, TOOL_NAME, "distance", -125, -25)
            server.moveNode(objectName, TOOL_NAME, "force", -125, 50)
        }
    }

    // Remove the motor nodes for sensor and moves other nodes
    if (complexity == 'sensor') {
        server.removeNode(objectName, TOOL_NAME, "motor1")
        server.removeNode(objectName, TOOL_NAME, "motor2")
        server.removeNode(objectName, TOOL_NAME, "motor3")
        server.removeNode(objectName, TOOL_NAME, "stopMotors")
        server.moveNode(objectName, TOOL_NAME, "color", 125, -100)
        server.moveNode(objectName, TOOL_NAME, "distance", 125, -25)
        server.moveNode(objectName, TOOL_NAME, "force", 125, 50)

        // Sets the refresh rate for the sensors to 10
        sensorRefresh = 10
    }
    
    // Moves nodes for advanced
    if (complexity == 'advanced') { 
        server.moveNode(objectName, TOOL_NAME, "color", 75, -175)
        server.moveNode(objectName, TOOL_NAME, "distance", 0, -175)
        server.moveNode(objectName, TOOL_NAME, "force", -75, -175)
        server.addNode(objectName, TOOL_NAME, "serial", "node", {x: 150, y: -175, scale:0.175});
    }

    // // Adds the FFT nodes for the activity
    // if (activity == 'fft') {
    //     server.addNode(objectName, TOOL_NAME, "FFTStart", "node", {x: -275, y:-100, scale:0.175});
    //     server.addNode(objectName, TOOL_NAME, "FFTLength", "node", {x: -275, y:-25, scale:0.175});
    //     server.addNode(objectName, TOOL_NAME, "FFTAxis", "node", {x: -275, y:50, scale:0.175});
    //     server.addNode(objectName, TOOL_NAME, "FFTOutput", "node", {x: -275, y:125, scale:0.175});
    // }

    // Constantly sort the sensor data
    setInterval(() => { sortSensor(); }, 10);
 
    //Serial Communication
    server.addReadListener(objectName, TOOL_NAME, "serial", function(data){
        // Take whatever value you get and send it the Spike Prime Repl
        console.log(data.value);
        msg = data.value.toString();
        console.log(msg);
        setTimeout(() => { serial.writePort("send_serial('"+ msg +"')\r\n") }, 0);
    });

    // Listens for the stopMotors node
    server.addReadListener(objectName, TOOL_NAME, "stopMotors", function(data){
        // When true, stop the Spike motors
        if (data.value == 1) {
            console.log('motors off')
            stopMotors()
        }
        // When false, allow the motors to run
        if (data.value == 0) {
            runMotors = true
        }
    });

    // Listen for the motor1 node
    server.addReadListener(objectName, TOOL_NAME, "motor1", function(data){
        // If we are running motors, then run the motor at the speed of the value sent to the node
        if (runMotors) {
            setTimeout(() => { serial.writePort(motor1 + ".start(" + Math.round(data.value) + ")\r\n") }, 0);
            // setTimeout(() => { serial.writePort(motor1 + ".run_for_degrees(" + Math.round(data.value) + ")\r\n") }, 0);
        }
        // Else stop the motors
        else {
            stopMotors()
        }
    });

    // Listen for the motor2 node
    server.addReadListener(objectName, TOOL_NAME, "motor2", function(data){
        // If we are running motors, then run the motor at the speed of the value sent to the node
        if (runMotors) {
            setTimeout(() => { serial.writePort(motor2 + ".start(" + Math.round(data.value) + ")\r\n") }, 0);
            // setTimeout(() => { serial.writePort(motor2 + ".run_for_degrees(" + Math.round(data.value) + ")\r\n") }, 0);
        }
        // Else stop the motors
        else {
            stopMotors()
        }
    });

    // Listen for the motor3 node
    server.addReadListener(objectName, TOOL_NAME, "motor3", function(data){
        // If we are running motors, then run the motor at the speed of the value sent to the node
        if (runMotors) {
            setTimeout(() => { serial.writePort(motor3 + ".start(" + Math.round(data.value) + ")\r\n") }, 0);
            // setTimeout(() => { serial.writePort(motor3 + ".run_for_degrees(" + Math.round(data.value) + ")\r\n") }, 0);
        }
        // Else stop the motors
        else {
            stopMotors()
        }
    });

    // Listens for the motors node (used in beginner mode to control all motors)
    server.addReadListener(objectName, TOOL_NAME, "motors", function(data){
        // If we are running motors, then run all the motors at the speed of the value sent to the node
        if(runMotors) {
            if (motor1 != 'none') {
                setTimeout(() => { serial.writePort(motor1 + ".start(" + Math.round(-data.value) + ")\r\n") }, 0);
                // setTimeout(() => { serial.writePort(motor1 + ".run_for_degrees(" + Math.round(-data.value) + ")\r\n") }, 0);
            }
            if (motor2 != 'none') {
                setTimeout(() => { serial.writePort(motor2 + ".start(" + Math.round(data.value) + ")\r\n") }, 0);
                // setTimeout(() => { serial.writePort(motor2 + ".run_for_degrees(" + Math.round(data.value) + ")\r\n") }, 0);
            }
            if (motor3 != 'none') {
                setTimeout(() => { serial.writePort(motor3 + ".start(" + Math.round(data.value) + ")\r\n") }, 0);
                // setTimeout(() => { serial.writePort(motor3 + ".run_for_degrees(" + Math.round(data.value) + ")\r\n") }, 0);
            }
        }
        // Else stop the motors
        else {
            stopMotors()
        }
    });

    // Listens for the FFTAxis node. 0,1,2 are the only possible values (X,Y,Z axis)
    // server.addReadListener(objectName, TOOL_NAME, "FFTAxis", function(data) {
    //     if (data.value == 0) {
    //         FFTAxis = 0
    //     }
    //     else if (data.value == 1) {
    //         FFTAxis = 1
    //     }
    //     else if (data.value == 2) {
    //         FFTAxis = 2
    //     }
    //     else {
    //         FFTAxis = 0
    //     }
    // });

    // Listens for the FFTLength node. The length can only be a power of 2 between 16 and 2048.
    // server.addReadListener(objectName, TOOL_NAME, "FFTLength", function(data) {
    //     if (data.value > 2048) {
    //         FFTLength = 2048
    //     }
    //     else if (data.value < 16) {
    //         FFTLength = 16
    //     }
    //     else if (Number.isInteger(Math.log(data.value)/Math.log(2))) {
    //         FFTLength = data.value
    //     }
    //     else {
    //         FFTLength = Math.pow(2, Math.ceil(Math.log(data.value)/Math.log(2)))
    //     }
    // });

    // When true, calls fft on the Spike Prime, which gets an array of accelerometer values on axis FFTAxis of length FFTLength
    // server.addReadListener(objectName, TOOL_NAME, "FFTStart", function(data) {
    //     if (data.value == 1) {
    //         console.log('fft')
    //         setTimeout(() => { serial.writePort("fft(" + FFTAxis + "," + FFTLength + ")\r\n") }, 0);
    //     }
    // });

    // Listen for the screen node (beginner mode only)
    server.addReadListener(objectName, TOOL_NAME, "screen", function(data){
        setTimeout(() => { serial.writePort("hub.display.show(\"" + data.value + "\")\r\n") }, 0);
    });

    // Listen for the LED node (beginner mode only)
    server.addReadListener(objectName, TOOL_NAME, "LED", function(data){
        setTimeout(() => { serial.writePort("hub.led(" + data.value + ")\r\n") }, 0)
    });

    // Constantly read the sensor data
    setInterval(() => { continuousSensor(); }, sensorRefresh)

    updateEvery(0, 10);
}

// Gets the port ordering from the Spike Prime, which initialized itself
function initializePorts() {
    sensorData = readSensor()
    if (sensorData.includes('[') && sensorData.includes(',')) {
        sensorData = sensorData.substring(1, sensorData.length - 2)
        sensorData = sensorData.replace(/'/g, '')
        sensorData = sensorData.replace(/ /g, '')
        sensorData = sensorData.split(',')
        for (i = 0; i < sensorData.length; i++) {
            ports[i] = sensorData[i]
        }
        console.log(ports)
        definePorts()
    }
    else {
        setTimeout(() => { initializePorts(); }, 0);
    }
}

// Change the names of the motors and sensor to be their corresponding ports
// For example, a motor on port A is named "A"
function definePorts() {
    if (ports.indexOf('motor') != -1) {
        firstMotor = ports.indexOf('motor')
        motor1 = portLetters[firstMotor]
        if (ports.indexOf('motor', firstMotor + 1) != -1) {
            secondMotor = ports.indexOf('motor', firstMotor + 1)
            motor2 = portLetters[secondMotor]
            if (ports.indexOf('motor', secondMotor + 1) != -1) {
                thirdMotor = ports.indexOf('motor', secondMotor + 1)
                motor3 = portLetters[thirdMotor]
            }
        }
    }
    if (ports.indexOf('color') != -1) {
        colorSensor = portLetters[ports.indexOf('color')]
    }
    if (ports.indexOf('distance') != -1) {
        distanceSensor = portLetters[ports.indexOf('distance')]
    }
    if (ports.indexOf('force') != -1) {
        forceSensor = portLetters[ports.indexOf('force')]
    }
    console.log(motor1, motor2, motor3, colorSensor, distanceSensor, forceSensor)
}


// Read data from the Spike Prime
function readSensor() {
    sensorData = serial.getSensor()
    return sensorData
}

// Tells the Spike to execute the read function defined in initialize.py
function continuousSensor() {
    serial.writePort("read()\r\n")
}

// Sorts the sensor data and sends it to the appropriate process function based on:
// Color is the only string, and is one of the colors array defined at the top
// Force is the only float number between 0 and 1
// Distance is the only float number above 1
// Accelerometer is the only array of exactly length 6
// FFT data either comes in lengths of 2^n or 2^n + 1
// For 2^n data, add it to a array that stores all 2^n length arrays in a row
// For 2^n + 1 data, this is the end of the FFT data because it has the fs at the end
async function sortSensor() {
    sensorData = readSensor()
    sensorData = sensorData.replace(/ /g, '')
    arr = sensorData.replace(/\[/g, '')
    arr = arr.replace(/\]/g, '')
    arr = arr.replace(/{.*}/, '')
    arr = arr.split(',')
    if (colors.includes(sensorData) && sensorData.toString().length > 0) {
        processColor(sensorData)
    }
    else if (parseInt(sensorData) <= 1 && sensorData.toString().length > 0) {
        processForce(sensorData)
    }
    else if (!isNaN(sensorData) && parseInt(sensorData) > 1 && sensorData.toString().length > 0) {
        processDistance(sensorData)
    }
    else if (arr.length == 6) {
        processAccelerometer(sensorData)
    }
    // else if (arr.length == 128) {
    //     if (JSON.stringify(arr) != JSON.stringify(oldArr)) {
    //         fullFFT = fullFFT.concat(arr)
    //         oldArr = arr
    //     }
    // }
    // else if (Number.isInteger(Math.log(arr.length - 1)/Math.log(2)) && arr.length > 9 && sensorData.includes("[")) {
    //     fullArr = fullFFT.concat(arr)
    //     fs = fullArr.pop()
    //     fs = parseFloat(fs)
    //     if (JSON.stringify(fullArr) != JSON.stringify(oldFullArr) && fs != oldFs) {
    //         processFFT(fullArr, fs)
    //         fullFFT = []
    //         oldFullArr = fullArr
    //         oldFs = fs
    //     }
    // }
}

// Processes the distance data and writes it to the node
function processDistance(sensorData) {
    distance = sensorData
    server.write(objectName, TOOL_NAME, "distance", server.map(distance, 0, 150, 0, 150), "f")
}

// Processes the color data and writes it to the node
function processColor(sensorData) {
    color = sensorData
    server.write(objectName, TOOL_NAME, "color", color, "f")
}

// Processes the accelerometer/gyroscopic data and writes it to the nodes
function processAccelerometer(sensorData) {
    accel = sensorData
    accel = accel.replace(/\(/g, '')
    accel = accel.replace(/\)/g, '')
    accelArr = accel.split(',').map(x=>+x)
    server.write(objectName, TOOL_NAME, "accelerometerX", server.map(accelArr[0], -5000, 5000, -5000, 5000), "f")
    server.write(objectName, TOOL_NAME, "accelerometerY", server.map(accelArr[1], -5000, 5000, -5000, 5000), "f")
    server.write(objectName, TOOL_NAME, "accelerometerZ", server.map(accelArr[2], -5000, 5000, -5000, 5000), "f")
    server.write(objectName, TOOL_NAME, "gyroscopeX", server.map(accelArr[3], -5000, 5000, -5000, 5000), "f")
    server.write(objectName, TOOL_NAME, "gyroscopeY", server.map(accelArr[4], -5000, 5000, -5000, 5000), "f")
    server.write(objectName, TOOL_NAME, "gyroscopeZ", server.map(accelArr[5], -5000, 5000, -5000, 5000), "f")
}

// Processes the force data and writes it to the node
function processForce(sensorData) {
    force = sensorData * 10
    server.write(objectName, TOOL_NAME, "force", server.map(force, 0, 10, 0, 10), "f")
}

// // Process the arr of FFT data sampled at fs times per second by posting it to our heroku server
// function processFFT(arr, fs) {
//     maxMag = 0
//     arr = Object.values(arr.map(s => Number(s)))

//     const headers = {
//         "Content-Type": "application/json",
//         "Accept": "application/json"
//     }
//     const body = JSON.stringify({
//         "amplitude": arr, 
//         "sampling_rate": fs,
//         "percentage": 0.5
//     })

//     fetch("https://ptc-fft-server.herokuapp.com/fft/simple_fft", {headers, method: "POST", body})
//         .then(res => res.json())
//         .then(res => {
//             console.log(res.magnitude)
//             console.log(res.frequencies)
//             for (var i = 0; i < res.magnitude.length; i++) {
//                 if (res.magnitude[i] > maxMag) {
//                     maxMag = res.magnitude[i]
//                     maxMagIndex = i
//                 }
//             }
//             server.write(objectName, TOOL_NAME, "FFTOutput", res.frequencies[maxMagIndex], "f")
//         })
//         .catch(res => { console.log("error " + res)})
// }

// Send commands to stop all the motors
function stopMotors() {
    runMotors = false
    if (motor1 != "none") {
        serial.writePort(motor1 + ".stop()\r\n")
    }
    if (motor2 != "none") {
        serial.writePort(motor2 + ".stop()\r\n")
    }
    if (motor3 != "none") {
        serial.writePort(motor3 + ".stop()\r\n")
    }
}

// Updates readListeners
function updateEvery(i, time){
    setTimeout(() => {
        updateEvery(++i, time);
    }, time)
}

// Wait for the connection to be established with the Spike Prime before starting up
server.addEventListener("initialize", function () {
    if (exports.enabled) setTimeout(() => { startHardwareInterface() }, 10000)
});

// Stop motors on server shutdown
server.addEventListener("shutdown", function () {
    stopMotors()
});
