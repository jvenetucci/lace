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
- [Acknowledgments](#Acknowledgments)
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
Included with the project are a variety of test suites and tools to help test vertain areas of lace.

### `makeTransaction.js`
This is a javascript application that will quickly populate the `lace-poet.yaml` network with randomly generated assets that have randomly generated histories. The script is located at `performanceTesting/makeTransactions.js`.

In order to run it you will need to have [Node.js](http://nodejs.org) and its package manager **npm** installed.

How to use

First packages for the script must be installed:
```Plain
$ cd server
$ npm install
$ cd ../performanceTesting
$ npm install
```

Once the packages are done you can run the script with
```Plain
$ node makeTransactions.js <Number of Assets>
```
For example, running `node makeTransactions.js 5` will generate five random assets and send them to the network. The script will out the RFID's of each asset so you can view them using the company web client.

### `test2.py`
This python file acts as a test suite. It sends valid and invalid transactions to the validator nodes and makes sure that the right output is given. For more information see `tests/test2.py`.

In order to run this you will need to have Python3 installed.

To Run
```Plain
python3 test2.py
```

### `test.py` & `sendit.sh`
These two files are used for generating transactions and sending them to the validator nodes. Both files are located in `/tests/`.

`test.py` has three options and will make a transaction that either (1) Creates an agent, (2) Creates an asset, or (3) Touches an asset. Run `python3 test.py` to view the available options.

After successfully using `test.py` a file called `lace.batches` is created. This file contains the transaction data. In order to send it you use the shell script `sendit.sh`.
```Plain
$ ./sendit.sh
```

---

## Licensing
This project is licensed under the MIT License. A copy of this license is included in the rooth directory. See `LICENSE.md`.

The copyright to this project belongs to Team B which is comprised of the individuals listed in the [Authors](#Authors) section of this document.

The project uses the Hyperledger Sawtooth platform which is licensed under Apache 2.0. A copy of its license and copyright are located in the root directory as `sawtooth-license.md` and `sawtooth-copyright.md`.

---

## Authors
This project was created by a group of college students as part of their senior capstone project. The following people were in the group:
- Roberto Avilia <ravila@pdx.edu>
- Andrew Burnett <burnett@pdx.edu>
- Jeff De La Mare <dejef@pdx.edu>
- Nick Nation <nnation@pdx.edu>
- Phillip Nguyen <hien2@pdx.edu>
- Anthony Tran <anthot@pdx.edu>
- Joseph Venetucci <venetuc@pdx.edu>

---

## Acknowledgments
Team B would like to thank our project sponsor for providing us the oportunity to work with them and the help that they provided during the development of this project.

We would also like to thank our capstone professor who helped guide us throught the capstone process.

Finally we would also like to thanks the folks who worked on the Hyperledger Sawtooth project. The community behind the project became a big resource during the entire process.

---

## References
- [Sawtooth Documentation](https://sawtooth.hyperledger.org/docs/core/releases/latest/contents.html)
- [Useful Validator Endpoints](https://sawtooth.hyperledger.org/docs/core/releases/latest/rest_api/endpoint_specs.html)
- [Sawtooth-Core Github](https://github.com/hyperledger/sawtooth-core)
- [Sawtooth Supply Chain Github](https://github.com/hyperledger/sawtooth-supply-chain)

---