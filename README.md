# SparkplugB Module for IoT Edge

## Overview

The use of SparkPlug B and MQTT is used in the Industrial World; in specific sectors such as Oil & Gas, Energy, and manufacturing. Devices such as PLCs, SCADAS, and Gateways that can transmit telemetry through of MQTT using the SparkPlug B format to obtain different advantages.

In this article, we will briefly introduce SparkPlug B and explain how to implement an IoT Edge module to subscribe to an MQTT broker, process messages in Sparkplug format, and send them to the Azure IoT platform decoded in JSON. Once the data is in IoT Hub, we can monitor it in real-time and enable continuous data export to Azure Data Explorer to expand reporting and analytics capabilities with the data.

![Diagram  Description automatically generated](/assets/images/clip_image001.png)

## What is Sparkplug B?

Sparkplug B is an Open-Source specification designed based on the characteristic features of IoT applications. It helps define topics and message payload that are not specified by standard MQTT and allows non-MQTT terminal devices to transfer data with MQTT Server through Edge of Network.

Sparkplug B helps clients seamlessly integrate data between their sensors, devices or gateways and applications within an MQTT infrastructure and enable interoperability. 

One of the fundamental advantages of using SparkPlug B over MQTT is that bandwidth consumption is reduced by 80-90% in general, allowing solutions to be scaled and hundreds of devices to be connected.

For more information on the Sparkplug B specification, see https://projects.eclipse.org/projects/iot.sparkplug

##  

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

This article explains how we can deploy an IoT Edge module that is able to connect to the MQTT broker, read the messages in a Sparkplug B format and send them to IoT Central to monitor the messages. In addition, we will show how we export this information to an Azure Data Explorer in order to generate reports and analytics from this data.

## Data Flow

It is frequently to find in an OT environment various devices connected to the industrial network such as Modbus equipment, PLC, OPC US, RTU, Sensors, IoT devices, and others; all this equipment is connected to PLCs or SCADAs, Gateways or Devices that have If MQTT and Sparkplug B are enabled, they will send the telemetry generated by the devices to an MQTT Broker.

What we are going to enable is a Gateway with IoT Edge installed; this can be a VM or a physical device; this solution will provide an MQTT broker based on the Open source Mosquitto; in this document, we will use the MQTT Broker edge module, but there are different options to do it, like installing an MQTT Broker in the OS, but it supposes a double administration.

IoT Edge will collect the data, and through the Sparkplug Decoding Module, it will receive in SparkPlug B format and decode it in a JSON to be able to send it to Azure IoT to be able to store the information, provide visibility and monitoring with the data perform advanced analytics such as efficiency analysis of the operation, alarm analysis, and being able to enable Artificial Intelligence to enable anomaly detection, predictive maintenance, downtime prevention, among others.

![Diagram  Description automatically generated](/assets/images/clip_image002.png)

  

## Architecture

This architecture, is described the different components that we will use in the solution.

![Chart  Description automatically generated](/assets/images/clip_image003.png)

## Dataflow 

1. Devices that produce telemetry in SparkPlug B format, typically are PLC, Gateway, and SCADA system enabled with this format

2. An Edge device, in this case Linux Ubuntu 20, It will have IoT Edge installed, the MQTT broker edge module, and enable the function to capture MQTT messages, decode them and send them to the cloud. there are multiple alternatives such as VMs, Windows Devices with EFLOW, Raspberry PI, or an Edge Device with Industrial capacity, see  https://devicecatalog.azure.com/

3. MQTT Broker edge module. This will receive the messages and allow you to publish and subscribe to it to transmit the messages 

4. IoT Edge. IoT Edge modules are units of execution, implemented as Docker compatible containers, that run your business logic at the edge see what it is Azure IoT Edge https://docs.microsoft.com/en-us/azure/iot-edge/about-iot-edge?view=iotedge-2020-11

5. SparkPlug B Module. This module will transform the Sparkplug B format to JSON in plain text

6. Azure IoT Hub

7. Azure Data Explorer

8. Azure Container Registry to store the images of the container.

### Pre requirements

·   Azure subscription.

·   Linux device deployed on which IoT Edge will be installed

·   Be receiving telemetry in Sparkplug B format in an MQTT broker edge module

·   An IoT Central App. https://docs.microsoft.com/en-us/azure/iot-central/core/howto-create-iot-central-application

·   Developer’s laptop to deploy the solution 

o  Visual Studio Code

o  Docker 

o  NodeJS

·   MQTT Client

 

## Payload definition

Sparkplug B defines a standard, structured, data-rich but efficient payload format. 

The core payload contains a structured series of key-value pairs defining an array of metrics and associated metadata. The specification defines a variety of optional fields for each metric, such as name, description, datatype, checksum, historical data flag, and many more. Data type indicators accommodate complex types common in industrial applications, like matrices and user-defined types (UDTs). The payload specification also permits an array of custom properties for each metric, such as engineering units or scaling limits, that are published along with the primary process variable or data object. The full payload is then timestamped, sequenced, and encoded using Google protocol buffers (protobufs), an efficient, interoperable, binary representation of the structured data, which maintains a small on-the-wire footprint without sacrificing complexity. When decoded, the payload is typically represented in JavaScript object notation (JSON) but is compatible with many formats. 

Here is an example of a simple spBv1.0 payload decoded into JSON: 

`*{ "timestamp": 1486144502122,*` 

`*"metrics":*`

`*[{*`

`*"name": "My Metric",*` 

`*"alias": 1,*` 

`*"timestamp": 1479123452194,*` 

`*"dataType": "String",*` 

`*"value": "Test"*` 

`*}], "seq": 2 }*`

# Solution implementation 

In the next section, we will prepare, configure and deploy the complete solution. It is assumed that certain parts, such as preparing the Linux and creating the IoT Central app, are ready, given other articles explaining the step-by-step process.

 

## Build and push Module in ACR

Tutorial to build and push modules, see

https://docs.microsoft.com/en-us/azure/iot-edge/tutorial-machine-learning-edge-06-custom-modules?view=iotedge-2020-11#build-publish-and-deploy-modules 

1. Get the ACR credentials

![Graphical user interface, text, application  Description automatically generated](/assets/images/clip_image005.png)

 

2. Open Visual Studio Code, create a folder, and run command in terminal for clone the code

`*git clone* [*https://github.com/iotrockstars/SparkplugB-Edge-Module`*](https://github.com/iotrockstars/SparkplugB-Edge-Module)

 

3. In the Visual Studio Code project, configure the .env file

![Graphical user interface  Description automatically generated](/assets/images/clip_image006.png)

 

4. Update “version” and “repository”, in “module.json” file

![Text  Description automatically generated](/assets/images/clip_image007.png)

 

5. Save all changes.

 

6. Now that we have made the configuration changes, we are ready to build the images and publish them to our Azure container registry. 

 

7. In Visual Studio Code, right-click on “deployment.template.json” file and choose “Build and Push IoT Edge Solution”.

 

![img](/assets/images/clip_image008.png)

##  

## MQTT Broker Edge Module

### Description

Typically, when there is MQTT messaging, brokers installed in the operating system are used, the problem is that there is double administration, on the one hand, the IoT Edge runtime and its modules, and at the operating system level, the MQTT broker Edge Module, an MQTT broker has been created experimentally based on Mosquitto to be implemented at the Azure IoT Edge runtime.

### Configuration

 The module configuration will be done through Create Options of the module, so the communication port must be configured, by default is using port 1883, and the service configuration is through the mosquito.conf file

`"createOptions": "{\"Hostname\":\"mosquitto\",\"Cmd\":[\"/usr/sbin/mosquitto\",\"-c\",\"/mosquitto/config/mosquitto.conf\"],\"HostConfig\":{\"PortBindings\":{\"1883/tcp\":[{\"HostPort\":\"1883\"}]}}}"`

Once the solution is implemented, its operation can be verified by performing a telnet command to the device's hostname with the configured port.

`telnet myserver 1883` 

 

![Text  Description automatically generated](/assets/images/clip_image009.png)

 

Other tests that can be done are with an MQTT client to verify communication and the configuration.

### Routing

This module has no logic attached to the routing input or output.

## Sparkplug B Module

### Description

This module will be in charge of connecting with the MQTT Edge module through the defined port; it will subscribe to the specified topics, and the module can transform from Sparkplug to Json in plain text.

## Configuration

The module expects the following configurations

|            |                                                              |                                                          |
| ---------- | ------------------------------------------------------------ | -------------------------------------------------------- |
| **Ip**     | Hostname or IP of the server where the IoT Edge is  installed | myserver                                                 |
| **topics** | List of topics to subscribe. If you want to subscribe all leave  # | "spBv1.0/YOUR_DEVICES/DDATA/YOUR_DEVICE_OR_#_FOR_COMODIN |

 

## Prepare the manifest for IoT Central

Configure Device Module. When the IoT Edge runtime connects to your IoT Central application, it downloads the deployment manifest. The runtime uses the information in the deployment manifest to determine which modules to install and how to configure them. Modules download from a container registry such as Azure Container Registry. 

The deployment manifest you used installs the two required system modules, edgeAgent and edgeHub, and two custom modules SparkPlugB and MQTT edge module. This custom module sends ambient and machine telemetry to IoT Central and has the following properties, that an operator can use to configure the module:

1. Take the “manifest_iotcentral.json” 

2. Update the ACR credentials 

![Text  Description automatically generated](/assets/images/clip_image010.png)

 

3. Adjust the “econfig” section:

Ip or dns server of mqtt: **for testing use** TEST.MOSQUITTO.ORG

Topics: **for testing use** spBv1.0/SparkplugDevices/DDATA/JsonScada/DemoVPS

Tip: remember that can use willcard with #: **for testing use** spBv1.0/SparkplugDevices/DDATA/#

For better understanding of the configuration think in this json format

  `{    "ip": "<myserver>",    "topics":[      "spBv1.0/SparkplugDevices/DDATA/JsonScada/DemoVPS",       "spBv1.0/SparkplugDevices/DDATA/JsonScada/DemoVPS2"    ]  }`  

Finally, to insert the variable into the manifest replace '' with '' \, all within double quotes

`"{\"ip\":\"MQTT_DNS_OR_IP\",\"topics\":[\"spBv1.0/ADD_ESPECIFIC_TOPICS_N1\",\"spBv1.0/spBv1.0/ADD_ESPECIFIC_TOPICS_N2\"]}"`

 

![A picture containing text  Description automatically generated](/assets/images/clip_image012.png)

 

Check version of the ACR image

![A picture containing text  Description automatically generated](/assets/images/clip_image013.png)

 

4. Save the file for next steps

 

## Create an IoT Central edge and deploy custom modules

 

Install IoT Edge and connect with IoT Central, see 

https://docs.microsoft.com/en-us/learn/modules/connect-iot-edge-device-to-iot-central/

https://docs.microsoft.com/en-us/learn/modules/connect-iot-edge-device-to-iot-central/4-deploy-iot-edge-to-virtual-machine

https://docs.microsoft.com/en-us/learn/modules/connect-iot-edge-device-to-iot-central/

 

1. Create the device template

 

![Graphical user interface, application, Teams  Description automatically generated](/assets/images/clip_image014.png)

 

2. Upload the file “manifest_iotcentral.json” to iot central

 

![Graphical user interface, text, application, email  Description automatically generated](/assets/images/clip_image015.png)

3. Click in create button, apply this template to the IoT edge and see the telemetry sparkplug B.

![Graphical user interface, text, application  Description automatically generated](/assets/images/clip_image016.png)

 

Today this code is running in production for two customers of Oil & Gas 

Tested scenarios: 

·   Working in ubuntu 18.04 tls, 20.04 tls ok 

·   Working in windows 10 EFLOW ok 

## For testing 

For testing we are using a MQTT cliente to send telemetry to the MQTT edge module using https://test.mosquitto.org/ and the topic spark plug B v1.0 “spBv1.0/SparkplugDevices/DDATA/JsonScada/DemoVPS” 

![Text  Description automatically generated](/assets/images/clip_image017.png) 

# Appendix – Configuration on IoT Central

 

1. Publish the device template.

 

![Graphical user interface, text, application  Description automatically generated](/assets/images/clip_image018.png)

2. Create the device![Graphical user interface, application, Word  Description automatically generated](/assets/images/clip_image019.png)

 

3. Open the device![Graphical user interface, text, application, email  Description automatically generated](/assets/images/clip_image020.png)

![Graphical user interface, text  Description automatically generated](/assets/images/clip_image021.png)

4. Open connect and copy the information for DPS enrollment

 

![Graphical user interface, text, application  Description automatically generated](/assets/images/clip_image022.png)

 

5. Install IoT Edge

[Create and provision an IoT Edge device on Linux using symmetric keys - Azure IoT Edge | Microsoft Docs](https://docs.microsoft.com/en-us/azure/iot-edge/how-to-provision-single-device-linux-symmetric?view=iotedge-2018-06&tabs=azure-portal%2Cubuntu)

 

6. In the IoT Edge, open the config file

`sudo nano /etc/iotedge/config.yaml`

 

![Text  Description automatically generated](/assets/images/clip_image023.png)

 Add your IOT Central configuration

  `# DPS symmetric key provisioning configuration  provisioning:    source:  "dps"    global_endpoint:  "https://global.azure-devices-provisioning.net"    scope_id:  "<SCOPE_ID>"    attestation:     method:  "symmetric_key"       registration_id: "<REGISTRATION_ID>"     symmetric_key:  "<SYMMETRIC_KEY>"`  

 

![Text  Description automatically generated](/assets/images/clip_image024.png)

 

7. Apply the changes

sudo iotedge system apply

![Text  Description automatically generated](/assets/images/clip_image025.png)

 

8. Check the modules in the iotedge

`sudo systemctl status iotedge`

 

![img](/assets/images/clip_image026.png)

 

9. Check iot central modules running ok![Graphical user interface, text, application, Teams  Description automatically generated](/assets/images/clip_image027.png)

10. Now you can see the telemetry on IoT Central and now we can use export or connect with other tools for example Azure Data Explorer, DataLakeGen2, etc.

![Graphical user interface, application  Description automatically generated](/assets/images/clip_image028.png) 

![Graphical user interface, application  Description automatically generated](/assets/images/clip_image029.png)

 

![A screenshot of a computer  Description automatically generated](/assets/images/clip_image030.png)

 

11. Validate the IoT Edge logs of the custom module running in the iotedge

![Text  Description automatically generated](/assets/images/clip_image031.png)
