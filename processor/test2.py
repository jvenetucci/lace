''' to use this test one must already know the private key.  on the cli
input usr0_prv_key, usr1_prv_key, or usr2_prv_key.  This distinction would
exist depending on who holds keys and has access to the form from which a 
transaction is created.  

When testing, create_agent should be run with one of the aforementioned 
users, then we can see if assets can be created and touched repeatedly.

It can also be seen that a bogus private key is the default case when an
invalid input is provided from the cli. We'd like to see that not every 
user can touch an asset.'''


# Utilities
from hashlib import sha512
import subprocess
import sys
import secp256k1
import time
import uuid
import requests
import json

# Sawtooth SDK
from sawtooth_sdk.protobuf.transaction_pb2 import TransactionHeader
from sawtooth_sdk.protobuf.transaction_pb2 import Transaction
from sawtooth_sdk.protobuf.transaction_pb2 import TransactionHeader
from sawtooth_sdk.protobuf.batch_pb2 import Batch
from sawtooth_sdk.protobuf.batch_pb2 import BatchHeader
from sawtooth_sdk.protobuf.batch_pb2 import BatchList

# Lace structures and addressing
from protobuf.payload_pb2 import Payload, CreateAssetAction
from protobuf.payload_pb2 import CreateAgentAction, TouchAssetAction
import addressing

# considering making private key for user0 0000000...000000 and user1 111111...11111 etc
def _get_prv_key(args):
    if 1 < len(args) :
        if args[1] == "usr0_key":       # len 64 vs 66
            return "03640e18e4f5d932236daa53e10f5e09609c8e21a8e71caaa4674ee35dfb4266"
        elif args[1] == "usr1_key":
            return "41b6c45f8138da9e6c3e6978a67509fd01acfec753fc4dfdc1d5cd08a59ac551"
        elif args[1] == "usr2_key":
            return "13143ae71c154fb44d931d3745dd71d5541e189e00bc4d3aa2d53d69bfe7b421"
        # Generate a bogus pub key that will fail at _verify_agent(state, public_key)
    print("The format is `test.py touch_asset <required private_key> <required rfid>`"
            + "generated a new private key\n")
    return "3957568ed763a276a9c60bb1678cfe4c653f8039a9e592100fb28f0fa9e64351"

def _get_time():
    return int(time.time())


def _make_rfid():
    rfid = str(uuid.uuid4()).replace("-", "")
    return rfid


def _create_signer(private_key):
    signer = secp256k1.PrivateKey()
    signer.set_raw_privkey(bytes.fromhex(private_key))
    return signer
    

class TestLace():

    def create_agent(self, args):       # args [create_agent, private_key, name]
        if len(args) < 1:
            print("\nA private key is required to create and agent.\n")
            exit()

        private_key = _get_prv_key(args)
        signer = _create_signer(private_key)

        if 2 < len(args):
            name = args[2]
        else:
            name = "noname"

        # make the agent_payload, and specific attributes
        agent_action = CreateAgentAction(
                #public_key = self.public_key,
                public_key = signer.pubkey.serialize().hex(),
                name = name,
        )

        agent_payload = Payload(
            action = 1,
            timestamp = _get_time(),
            create_agent = agent_action,
        )

        # serialize before sending
        payload_bytes = agent_payload.SerializeToString()

        # Pack it all up and ship it out
        self.create_transaction(signer, payload_bytes)


    def create_asset(self, args):    # args [create_asset, private_key]
        # must have private key, otherwise the user could create an asset 
        # without the proper credentials, potentially polluting state.
        private_key = _get_prv_key(args)
        signer = _create_signer(private_key)

        # make the asset_payload, and specific attributes
        asset_action = CreateAssetAction(
            rfid = _make_rfid(),
            size = "Mens 10",
            sku = "0 123456789 1",
            longitude = 1,
            latitude = 1,
        )

        ###### GLOBAL RFID FOR TESTING PURPOSES ######
        global rfid0
        rfid0 = asset_action.rfid
        ##############################################

        asset_payload = Payload(
            action = 0,
            timestamp = _get_time(),
            create_asset = asset_action,        
        )

        # serialize before sending
        payload_bytes = asset_payload.SerializeToString()

        # Pack it all up and ship it out
        self.create_transaction(signer, payload_bytes)


    def touch_asset(self, args):    # args [touch_asset, private_key, rfid]
        # sawtooth-supply-chain/server/system/config.js takes in a json object that
        # contains a private key and a secret, plus network info, and 
        # must know the rfid of an asset to touch it (in theory, obtained through scan)
        if len(args) < 1:
            print("A private key must be provided to touch an asset")
            exit()
        elif len(args) < 2:
            print("A rfid is necessary to discern the item being touched")
            exit()
        
        private_key = _get_prv_key(args)    # verify the private key is valid in handler.py
        signer = _create_signer(private_key)

        rfid = args[2]

        touch_action = TouchAssetAction(
            rfid = rfid,
            longitude = 2,
            latitude = 3,
        )

        touch_payload = Payload(
            action = 2,
            timestamp = _get_time(),
            touch_asset = touch_action,
        )

        payload_bytes = touch_payload.SerializeToString()

        self.create_transaction(signer, payload_bytes)


    def create_transaction(self, signer, payload_bytes):
        txn_header_bytes = TransactionHeader(
            family_name='lace',
            family_version='0.1',
            inputs=[addressing.NAMESPACE],
            outputs=[addressing.NAMESPACE],
            signer_public_key = signer.pubkey.serialize().hex(),
            # In this example, we're signing the batch with the same private key,
            # but the batch can be signed by another party, in which case, the
            # public key will need to be associated with that key.
            batcher_public_key = signer.pubkey.serialize().hex(),
            # In this example, there are no dependencies.  This list should include
            # an previous transaction header signatures that must be applied for
            # this transaction to successfully commit.
            # For example,
            # dependencies=['540a6803971d1880ec73a96cb97815a95d374cbad5d865925e5aa0432fcf1931539afe10310c122c5eaae15df61236079abbf4f258889359c4d175516934484a'],
            dependencies=[],
            payload_sha512=sha512(payload_bytes).hexdigest()
        ).SerializeToString()

        # Ecdsa signing standard, then remove extra ecdsa bytes using compact.
        txn_signature = signer.ecdsa_sign(txn_header_bytes)
        txn_signature_bytes = signer.ecdsa_serialize_compact(txn_signature)
        signature = txn_signature_bytes.hex()

        txn = Transaction(
            header=txn_header_bytes,
            header_signature=signature,
            payload=payload_bytes
        )

        txns = [txn]

        batch_header_bytes = BatchHeader(
            signer_public_key = signer.pubkey.serialize().hex(),
            transaction_ids=[txn.header_signature for txn in txns],
        ).SerializeToString()


        batch_signature = signer.ecdsa_sign(batch_header_bytes)
        batch_signature_bytes = signer.ecdsa_serialize_compact(batch_signature)
        signature = batch_signature_bytes.hex()

        batch = Batch(
            header=batch_header_bytes,
            header_signature=signature,
            transactions=txns
        )

        batch_list_bytes = BatchList(batches=[batch]).SerializeToString()


        # ship it out and scrape
        url = "http://localhost:8008/batches"
        headers = { 'Content-Type' : 'application/octet-stream' }
        payload = batch_list_bytes
        resp = requests.post(url, data=payload, headers=headers)

        time.sleep(2)   # let the transactions be committed.
        json_url = json.loads(resp.text)
      #  print("Batch status link: \n\n" + json_url["link"] + "\n")
        resp = requests.get(json_url["link"])
        json_batch_status = json.loads(resp.text)
        print("Batch status: " + json_batch_status["data"][0]["status"])


subprocess.run(["docker-compose", "-f" "../sawtooth-default.yaml", "up", "-d"])
time.sleep(15)
rfid0 = ''
test = TestLace()

# create the same agent repeatedly
# args = ["create_agent", "usr0_key", "bob"]
# getattr(test, args[0])(args)
# args = ["create_agent", "usr0_key", "bob"]
# getattr(test, args[0])(args) 
# args = ["create_agent", "usr0_key", "bob"]
# getattr(test, args[0])(args)
# args = ["create_agent", "usr0_key", "bob"]
# getattr(test, args[0])(args)
    # results of this are odd. running test2.py with 4 create agents using the same key and name
    # only adds one agent to the blockchain.  however, running test2.py for a second time yields 
    # the expected collision.

print("\t\tHAPPY PATH :)") 

print("\nCREATE THREE AGENTS")
args = ["create_agent", "usr0_key", "bob"]
getattr(test, args[0])(args)
args = ["create_agent", "usr1_key", "jan"]
getattr(test, args[0])(args)
args = ["create_agent", "usr2_key", "joe"]
getattr(test, args[0])(args)

print("\nCREATE ONE ASSET")
args = ["create_asset", "usr1_key"]
getattr(test, args[0])(args)

print("\nEACH AGENT TOUCHES ASSET ONCE")
args = ["touch_asset", "usr0_key", rfid0]
getattr(test, args[0])(args)
agrs = ["touch_asset", "usr1_key", rfid0]
getattr(test, args[0])(args)
agrs = ["touch_asset", "usr2_key", rfid0]
getattr(test, args[0])(args)


print("\n\t\tSAD PATH :(")

print("\nCREATE ASSET WITH BOGUS KEY") 
args = ["create_asset", "bogus_key", rfid0]
getattr(test, args[0])(args)

print("\nTOUCH W/ BOGUS KEY")
args = ["touch_asset", "bogus_key", rfid0]
getattr(test, args[0])(args)

print("\nTOUCH W/ BOGUS RFID")
args = ["touch_asset", "usr0_key", "bogus_rfid"]
getattr(test, args[0])(args)

subprocess.run(["docker-compose", "-f", "../sawtooth-default.yaml", "down"])
time.sleep(30)
# subprocess.run(["docker-compose -f sawtooth-default.yaml up"])

# # # touch asset with a bogus key
# args = ["touch_asset", "bogus_key", rfid0]
# getattr(test, args[0])(args)

# # touch asset with bogus rfid
# args = ["touch_asset", "bogus_key", "bogus_rfid"]
# getattr(test, args[0])(args)

# # create asset with bogus key 
# args = ["create_asset", "bogus_key", "rfid0"]
# getattr(test, args[0])(args)

# while loop to prove that wrapping works?

# create an asset with bogus key?

# more tests should be implemented once locking and other permissions have been put into place

# any other notable test cases?

# check for bogus private keys?

# collision of names?

# have rfid0 and rfid1, check that ownership works.