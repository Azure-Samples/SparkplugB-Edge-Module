# SparkplugB Module for IoT Edge

## Overview

SparkPlug B and MQTT is used in the Industrial World; in specific sectors such as Oil & Gas, Energy, and manufacturing. Devices such as PLCs, SCADAS, and Gateways that can transmit telemetry through MQTT using the SparkPlug B format which entails different advantages.

In this article, we will briefly introduce SparkPlug B and explain how to implement an IoT Edge module to subscribe to an MQTT broker, process messages in Sparkplug B format, and send them to the Azure IoT platform as JSON. Once the data is in IoT Hub, we can monitor it in real-time and enable continuous data export to Azure Data Explorer to expand reporting and analytics capabilities.

![Diagram  Description automatically generated](/assets/images/clip_image001.png)

## What is Sparkplug B?

Sparkplug B is an Open-Source specification designed based on the characteristic features of IoT applications. It helps to define topics and message payload that are not specified by standard MQTT and allows non-MQTT final devices to transfer data with the MQTT Server through the network.

Sparkplug B helps clients seamlessly integrate data between their sensors, devices or gateways and applications within an MQTT infrastructure and enable interoperability. 

One of the fundamental advantages of using SparkPlug B over MQTT is that bandwidth consumption is reduced by 80-90% in general, allowing solutions to be scaled to thousands of connected devices.

For more information on the Sparkplug B specification, see https://projects.eclipse.org/projects/iot.sparkplug


## Use cases

·   Asset Remote monitoring

·   Remote shop floor monitoring

·   Preventive equipment maintenance

·   Anomaly detection

·   IoT Energy management

 

## Advantages for the industry

Here are some of the benefits of using MQTT and Sparkplug B

### Benefits of MQTT

·   Simple and Open

·   Bandwidth efficiency 

·   Decouples devices from application

·   Widely adopted

### Benefits of Sparkplug

·   Interoperability with Open Standards

·   Unified namespaces

·   Enhanced data integrity

·   Fully auto Discovery tags

·   Low Administration

This article explains how we can deploy an IoT Edge module that is able to connect to the MQTT broker, read the messages in a Sparkplug B format and send them to IoT Hub to monitor the messages. In addition, we will show how to export this information to an Azure Data Explorer service in order to create reports and analytics using this data.

## Data Flow

It is common to find a wide variety of devices connected in an industrial network such as: Modbus equipment (TCP or RTU), Sensors, IoT devices, and others; all this equipment is connected to PLCs or SCADAs. It is also very likely that many of these final devices use MQTT with sparkplugb so all telemetria will have this format.

 We are going to enable a Gateway with IoT Edge installed; this can be a VM or a physical device; the solution installed on the IoT Edge will provide an MQTT broker based on the Open source Mosquitto; in this document, we will use the MQTT Broker edge module, but there are different options to do it, like installing an MQTT Broker in the OS, but it supposes a double administration.

IoT Edge will collect the data and, through the Sparkplug Decoding Module, it will:
1. Receive it in SparkPlug B format and decode it as a JSON
2. Send the telemetry to Azure IoT Hub.
3. Store the information
4. Provide visibility and monitoring the data in real-time
5. Performing advanced analytics such as efficiency analysis of the operation, alarm analysis, and enabling Artificial Intelligence to enable anomaly detection, predictive maintenance, downtime prevention, among others.

![Diagram  Description automatically generated](/assets/images/clip_image002.png)

  

## Architecture

Following architecture describes the different components that we will use in this the solution.

![Chart  Description automatically generated](/assets/images/clip_image003.png)

## Dataflow 

1. Devices that produce telemetry in SparkPlug B format, typically are PLC, Gateways, and SCADA systems.

2. An Edge device that can serve as gateway, in this case a Virtual Machine with Linux Ubuntu 20.04, It will have IoT Edge installed, the MQTT broker edge module, and enable the function to capture MQTT messages, decode them and send them to the cloud. In this example we use a virtual machine but in real life you have multiple alternatives such as VMs, Windows Devices with EFLOW, Raspberry PI, or an Edge Device with Industrial capacity, see  https://devicecatalog.azure.com/

3. MQTT Broker edge module. It will receive the messages and allow you to publish and subscribe to it to transmit the messages.

4. IoT Edge. IoT Edge modules are units of execution, implemented as Docker compatible containers, that run your business logic at the edge see what it is Azure IoT Edge https://docs.microsoft.com/en-us/azure/iot-edge/about-iot-edge?view=iotedge-2020-11

5. SparkPlug B Module. This module will transform the Sparkplug B format to JSON in plain text.

6. Azure IoT Hub.

7. Azure Data Explorer.

8. Azure Container Registry to store the images of the containers.

### Prerequisites

·   An Azure subscription.

·   Linux device deployed on which IoT Edge will be installed

·   Receiving telemetry in Sparkplug B format in an MQTT broker edge module

·   An IoT Hub service deployed. See https://learn.microsoft.com/en-us/azure/iot-hub/iot-hub-create-through-portal

·   Developer’s laptop to deploy the solution 

o  Visual Studio Code

o  Docker 

o  NodeJS

·   MQTT Client

 

## Payload definition

Sparkplug B defines a standard, structured, data-rich but efficient payload format. 

The core payload contains a structured series of key-value pairs defining an array of metrics and associated metadata. The specification defines a variety of optional fields for each metric, such as name, description, datatype, checksum, historical data flag, and many more. Data type indicators accommodate complex types common in industrial applications, like matrices and user-defined types (UDTs). The payload specification also permits an array of custom properties for each metric, such as engineering units or scaling limits, that are published along with the primary process variable or data object. The full payload is then timestamped, sequenced, and encoded using Google protocol buffers (protobufs), an efficient, interoperable, binary representation of the structured data, which maintains a small on-the-wire footprint without sacrificing complexity. When decoded, the payload is typically represented in JavaScript object notation (JSON) but is compatible with many formats. 

Here is an example of a simple spBv1.0 payload decoded into JSON: 

```json
{
    "timestamp": 1486144502122,
    "metrics": [
        {
            "name": "My Metric",
            "alias": 1,
            "timestamp": 1479123452194,
            "dataType": "String",
            "value": "Test"
        }
    ],
    "seq": 2
}
```

# Installation 

In the next section, we will prepare, configure and deploy the whole solution. It is assumed that certain parts, such as preparing the Linux and creating the IoT Hub service, are ready, given other articles explaining the step-by-step process.

 

## Build and push Module in ACR

For more information about how to build and push modules, please see [publish and deploy modules](https://docs.microsoft.com/en-us/azure/iot-edge/tutorial-machine-learning-edge-06-custom-modules?view=iotedge-2020-11#build-publish-and-deploy-modules) 

1. Create and get the Azure Container Registry credentials

![Graphical user interface, text, application  Description automatically generated](/assets/images/clip_image005.png)

 
2. Open Visual Studio Code, create a folder, and run the following command in the terminal in order to download this repo.

```bash
git clone https://github.com/iotrockstars/SparkplugB-Edge-Module
```


3. In the Visual Studio Code project, configure the .env file

![Graphical user interface  Description automatically generated](/assets/images/clip_image006.png)

 
4. Update “version” and “repository”, in “module.json” file

![Text  Description automatically generated](/assets/images/clip_image007.png)

 
5. Save all changes.

 

6. Now that we have made the configuration changes, we are ready to build the images and publish them to our Azure container registry. 

7. In Visual Studio Code, right-click on “deployment.template.json” file and choose “Build and Push IoT Edge Solution”.

![img](/assets/images/clip_image008.png)

##  

## Configure MQTT Broker Edge Module

### Description

In order to simplify the solution administration, and install and update the MQTT Broker remotely, we created an experimentally Edge Module with an MQTT Broker based on Mosquitto to be implemented at the Azure IoT Edge runtime.

### Configuration

 The module configuration will be done through Create Options of the module, so the communication port must be configured, by default is using port 1883, and the service configuration is through the mosquito.conf file

`"createOptions": "{\"Hostname\":\"mosquitto\",\"Cmd\":[\"/usr/sbin/mosquitto\",\"-c\",\"/mosquitto/config/mosquitto.conf\"],\"HostConfig\":{\"PortBindings\":{\"1883/tcp\":[{\"HostPort\":\"1883\"}]}}}"`

Important. If you require to change the configuration of the MQTT Broker, like authentication, enable or disable anonymous access, port, or another, you can do that in the mosquito.config file.

Once the solution is implemented, its operation can be verified by performing a telnet command to the device's hostname with the configured port.

```bash
telnet myserver 1883
```

![Text  Description automatically generated](/assets/images/clip_image009.png)

Also, you could use an MQTT client to perform tests to verify communication and the configuration.

### Routing

This module has no logic attached to the routing input or output.


## Sparkplug B Module

### Description

This module will be in charge of connecting with the MQTT Edge module through the defined port; it will subscribe to the specified topics, and the module can transform from Sparkplug to Json in plain text.

### Configuration

The module expects the following configurations in the module's Environment Variables

|            |                                                              |                                                          |
| ---------- | ------------------------------------------------------------ | -------------------------------------------------------- |
| **Ip**     | Hostname or IP of the server where the IoT Edge is  installed | myserver                                                 |
| **topics** | List of topics to subscribe. If you want to subscribe all leave  # | "spBv1.0/YOUR_DEVICES/DDATA/YOUR_DEVICE_OR_#_FOR_COMODIN |

You need to define a new Environment Variable

* Name: econfig

* Type: Text

* Value: {"ip":"<IP/DNS of your MQTT Broker Module>","topics":[<list of topics separated by a semicolon>]}

Example: {"ip":"test.mosquitto.org","topics":["spBv1.0/SparkplugDevices/DDATA/JsonScada/DemoVPS"]}
 
Tip: remember that can use willcard with #: **for testing use** spBv1.0/SparkplugDevices/DDATA/#


## Test the solution

You can test the solution using an MQTT client to send simulated telemetry (In SparkplugB format) to the MQTT edge module. Please use the URL https://test.mosquitto.org/ and filter the topic “spBv1.0/SparkplugDevices/DDATA/JsonScada/DemoVPS”

![Text  Description automatically generated](/assets/images/clip_image017.png) 

## Resources

* [Installing IoT Edge](https://github.com/Azure/iot-edge-config) 

