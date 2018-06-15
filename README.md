# lace
## Overview
lace is a blockchain application for tracking assets moving through a supply chain. It ultilizes RFID technology to tag and unqiuely identify each asset. Using the unique RFID, each asset is given a digital identy on the blockchain. As assets move through the supply chain it's digital identity moves with it and is recorded on the blockchain.

This application was built on top of the [Hyperledger Sawtooth platform](https://www.hyperledger.org/projects/sawtooth). The application is comprised of three web applications that allow users to interact with a blockchain running on backend servers. Everything is deployed using [Docker](https://www.docker.com).

The frontend web clients were built in Javascript and the React framework. The backend was built using Python 3 and the Sawtooth SDK.

This application was created by a group of students as part of their senior capstone project. The application is licensed under the MIT License. For more information on the authors (including how to contact them) and the license please see the respective sections in this document.

---

## Table of Contents
- [Project & Directory Structure](#Project-&-Directory-Structure)
- [How to Build & Run](#How-to-Build-&-Run)
    - [sawtooth-default](#sawtooth-default)
    - [lace-poet](#lace-poet)
- [Usage Guide](#Usage-Guide)
- [Testing Tools](#Testing-Tools)
- [Licensing](#Licensing)
- [Authors](#Authors)
- [References](#References)

---

## Project & Directory Structure
The root directory of the project contains the following folders:
- **ClientApps** -- Contains code for the client web applications.
- **performanceTesting** -- Contains code for sending multiple transactions in a short amount of time.
- **procesor** -- Contains code for the lace transaction processor.
- **protos** -- Contains Protocol Buffer definition files.
- **server** -- Contains code for a backend server that transforms user input from the client apps to transactions that are sent to the blockchain validators.
- **test** -- Various test suites and programs for testing the transaction processor.

---

## How to Build & Run
This section will provide an overview of how to build & run the application. [Docker](https://www.docker.com) and docker-compose are required.

The idea behind running this application is that by using Docker a blockchain network can be quickly setup and simulated locally. Included in this project are two docker-compose yaml files that define different network setups.
- `sawtooth-default.yaml` defines a network with three separate web clients and a single blockchain validator node. All three web clients intereact with this single node. The node runs a blockchain that uses dev-mode as its consensus algorithm. This network should be used for testing new features and changes as it can quickly process transactions.
- `lace-poet.yaml` defines a network similar to sawtooth-default, but instead runs five validator nodes that each use Proof-of-Elapsed-Time (PoET) as their consensus algorithm. Each of the three web clients intereact with separate nodes instead of the same one. This setup more closely resembles an actual blockchain network in production.

The rest of this section is split into two parts that cover the two different setups.
- [sawtooth-default](#sawtooth-default)
- [lace-poet](#lace-poet)

### sawtooth-default
This network setup should be used when testing changes or new features to the application.

#### Build
Navigate to the root of the project directory and run the following:
```Bash
$ docker-compose -f sawtooth-default.yaml build
```
This will start building the docker images required to run the network. This may take a while as there are multiple images that need to be built. Once its finished move onto the next section.

#### Run
Once the docker images have been built you can run the network using the following:
```Bash
$ docker-compose -f sawtooth-default.yaml up
```
The network setup will be finished once you see logged messages about the client web apps running.

Here is a list of where each service in the network is running:

| Service       | Location         |
| --------------|------------------|
| Company Client| `localhost:3001` |
| Factory Client| `localhost:3003` |
| Shipper Client| `localhost:3002` |
| Validator Node| `localhost:8008` |

#### Stop & Tear Down
In order to stop the network push `CTRL-C` on your keyboard to stop the docker containers. The next thing you need to do is deconstruct the containers with the following:
```Bash
$ docker-compose -f sawtooth-default.yaml down
```

### lace-poet
This network setup more closely resembles an actual blockchain network in production. It runs five validator nodes each using PoET concensus.

#### Build
Navigate to the root of the project directory and run the following:
```Bash
$ docker-compose -f lace-poet.yaml build
```
This will start building the docker images required to run the network. This may take a while as there are multiple images that need to be built. Once its finished move onto the next section.

#### Run
Once the docker images have been built you can run the network using the following:
```Bash
$ docker-compose -f lace-poet.yaml up
```
The network setup will be finished once you see logged messages about the client web apps running.

Here is a list of where each service in the network is running:

| Service       | Location         |
| --------------|------------------|
| Company Client| `localhost:3001` |
| Factory Client| `localhost:3003` |
| Shipper Client| `localhost:3002` |
| Node 0        | `localhost:8008` |
| Node 1        | `localhost:8001` |
| Node 2        | `localhost:8002` |
| Node 3        | `localhost:8003` |
| Node 4        | `localhost:8004` |

#### Stop & Tear Down
In order to stop the network push `CTRL-C` on your keyboard to stop the docker containers. The next thing you need to do is deconstruct the containers with the following:
```Bash
$ docker-compose -f lace-poet.yaml down
```

---

## Usage Guide
This section will go over how to use lace and explain the supply chain workflow that it represents.

All interactions with the blockchain are done through the client apps. Each client app has a unique role to play in the supply chain. An asset will go through the following steps during its lifetime in the supply chain:
1. An order for the asset is created by a company.
2. A factory creates the asset from the order.
3. The factory hands off the asset to a shipper for delivery to the company.
    - The asset passes through the hands of potentially multiple shippers.
4. The shipper delivers the asset to the company that originally placed the order.
This workflow will be used as a guide on how to use lace.

### Creating an Order
All assets begin with an order. Navigate to the company client at `localhost:3001`. Log in and then proceed to the *Asset* tab in the top. From here select the *Create* option from options on the left. From here you'll need to input the details of the asset. Every asset needs these three things:
1. The RFID that will be used to tag this asset
2. A SKU
3. The size of the asset

After filling in the form you can click the *Submit* button to send the order to the blockchain. If everything was successful you should recieve a message saying that it was committed.
In case you want to randomly generate the three pieces of information for an order, you can select the *Scan* button which will randomly populate the fields for you.

### Manufacturing the Asset
Once an order has been placed a factory will need to manufacture it. Navigate to the factory client at `localhost:3003`. Log in and then proceed to the *Asset* tab in the top. From here select the *Transfer* option from options on the left. From here you'll need to input the RFID of the asset that was used in the order. Once you provide the RFID you can click *Submit*. Look for the commited message to confirm success.

### Shipping the Asset to the Company
After an asset has been manufactured it needs to be shipped to the order creator through a number of shippers. Navigate to the factory client at `localhost:3002`. There are three separate shippers to choose from. You can log into any of them. Select the *Asset* tab at the top and then the *Transfer* option from options on the left. From here you'll need to input the RFID of the asset. Once you provide the RFID you can click *Submit*. Look for the commited message to confirm success.

Repeat this step with different shippers if needed.

### Shipper Delivers Asset to Company
At some point the asset finally reaches the company that placed the order. In order to recieve the asset log back into the company client. Select the *Asset* tab at the top and then the *Transfer* option from options on the left. Input the RFID of the asset and select *Submit*.

### Viewing the History of an Asset
At this point the asset has passed through the entire supply chain. In order to see it's history select the *History* option on the left of the company client. Input the RFID of the asset and select *Submit*. The page should populate with information about the asset (RFID, Size, SKU) and a history of every touchpoint it went through.

---

## Testing Tools


---

## Licensing


---

## Authors

---

## References
document sawtooth
useful endpoints

---