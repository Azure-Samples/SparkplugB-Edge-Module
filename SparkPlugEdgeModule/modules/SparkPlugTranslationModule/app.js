'use strict';

var mqtt = require('mqtt');
var sparkplugPayload = require('sparkplug-payload');

var Transport = require('azure-iot-device-mqtt').Mqtt;
var Client = require('azure-iot-device').ModuleClient;
var Message = require('azure-iot-device').Message;

//Global variables
var topic="presence";
var envconfig="";
var MqttClient;
var iphostName;
var topics;

//take the config "ip server and topics" from enviroment variable
if(process.env.econfig) {
  envconfig = process.env.econfig;
  console.log("[Config] Variable de ambiente config: %s", envconfig);
}

Client.fromEnvironment(Transport, async function (err, client) {
  if (err) {
    throw err;
  } else {
    client.on('error', function (err) {
      throw err;
    });
    // Init MQTT Topics
    var config = await initialize();
    console.log("[Main] Preparing to connect MQTT Server");
    connectMqttTopic(config.ip);

    // connect to the Edge instance
    client.open(function (err) {
      if (err) {
        throw err;
      } else {
        console.log('IoT Hub module client initialized');
        handleMqttMessages(client);
      }
    });
  }
});

async function initialize(){
  let config =  await getConfigFile();
  iphostName = config.ip;
  topics = config.topics;
  console.log("[initialize] Hostname: %s", iphostName);
  console.log("[initialize] Topics: %s", topics);
  return config;
}

//toke the enviroment variable and parse to json
async function getConfigFile(){ 
  return new Promise(function (resolve) {
    console.log("[getConfigFile] Text obtained successfully");
    var obj = JSON.parse(envconfig);
    resolve(obj);
  });
}

function connectMqttTopic(ip){
  console.log("[connectMqttTopic] Connecting to MQTT server: mqtt://%s", ip);
  MqttClient = mqtt.connect("mqtt://"+ip);
  // On connect event
  MqttClient.on('connect', function() {
    console.log("[connectMqttTopic] Topics to subscribe: %s", topics.length);
    MqttClient.subscribe(topic);
     for(var i=0; i<topics.length; i++){
         console.log("[connectMqttTopic] Subscribing to %s", topics[i]);
         MqttClient.subscribe(topics[i]);
     }
      console.log("[connectMqttTopic] Subscribe to '%s' topic ", topic);
    });
    // On error event
  MqttClient.on("error", function(error){ 
    console.log("[connectMqttTopic] Can't connect to MQTT server: %s", error);
  });

  console.log("[connectMqttTopic] MQTT server connected: %s", MqttClient.connected);
  
};

function handleMqttMessages(IotClient){
  console.log("[handleMqttMessages] Listening for messages");
  
    MqttClient.on('message', (topic, message) => {
        console.log("%s - [handleMqttMessages] Message received for topic '%s'. Message length %s  %s", new Date().toISOString(), topic, message.length, new Date().toLocaleDateString());
        var message2 = "";
        // It assume message is SparkPlug coded
        try
        {
          var sparkplug = sparkplugPayload.get("spBv1.0");
          var decodedMessage = sparkplug.decodePayload(message);
          decodedMessage.ip = iphostName;
          decodedMessage.topic = topic;
          //decodedMessage.telemetryType = "MORE FILTERS";

          var decodedMessageText=JSON.stringify(decodedMessage);
          message2 = new Message(decodedMessageText);
        }
        // Assuming this is a normal message
        catch(err)
        {
          console.log("[handleMqttMessages] Message can't be processed as Sparkplug. Uploading original message");
          message2 = new Message(message);
        }
        
        //send to iothub or iotcentral
        var messageeventalert = `${ new Date().toISOString()} - Sending received MQTT message`;
        IotClient.sendOutputEvent('output1', message2, printResultFor(messageeventalert));
      });
    
    console.log("[handleMqttMessages] Closing funcion for listening messages");
}


// Helper function to print results in the console
function printResultFor(op) {
  return function printResult(err, res) {
    if (err) {
      console.log(op + ' error: ' + err.toString());
    }
    if (res) {
      console.log(op + ' status: ' + res.constructor.name);
    }
  };
}