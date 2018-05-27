import os
import sys
# Utilities
from hashlib import sha512
import sys
import secp256k1
import time
import uuid

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

def _get_time():
    return int(time.time())

def _make_rfid():
    rfid = str(uuid.uuid4()).replace("-", "")
    print("Generated RFID: '" + rfid + "'")
    return rfid

def createPrivateKey():
    signer = secp256k1.PrivateKey()
    private_key_bytes = signer.private_key
    return private_key_bytes, signer

def createPublicKey(CUSTOM_KEY):
    ###### Important signer setup information ######
    signer = secp256k1.PrivateKey()

    # Paste a new private key as hex here.
    #CUSTOM_KEY = "c2ec4fd94138d906cbae4b6260fc52a140e6647ae3adfdb43dcf075dbc168984"
    #CUSTOM_KEY = "41b6c45f8138da9e6c3e6978a67509fd01acfec753fc4dfdc1d5cd08a59ac551"

    # Comment out this next line to get a new key.
    signer.set_raw_privkey(bytes.fromhex(CUSTOM_KEY))

    private_key_bytes = signer.private_key
    public_key_bytes = signer.pubkey.serialize()

    public_key = public_key_bytes.hex()
    return public_key

def createAgent(name):

    private_key_bytes, signer = createPrivateKey()
    public_key = createPublicKey(private_key_bytes.hex())

    agent_action = CreateAgentAction(
        public_key = public_key,
        name = "default name",
    )

    print("\nAgent information:")
    print("Name = '" + name + "'")
    print("Public key = '" + public_key + "'")
    print("Private key = '" + private_key_bytes.hex() + "'\n")

    agent_action.name = name

    agent_payload = Payload(
        action = 1,
        timestamp = _get_time(),
        create_agent = agent_action,        
    )

    payload_bytes = agent_payload.SerializeToString()
    return payload_bytes, public_key, signer

def makeAsset(rfid):
    asset_action = CreateAssetAction(
    rfid = "",
    size = "Mens 10",
    sku = "0 123456789 1",
    longitude = 1,
    latitude = 1,
    )

    asset_action.rfid = rfid

    asset_payload = Payload(
        action = 0,
        timestamp = _get_time(),
        create_asset = asset_action,        
    )

    payload_bytes = asset_payload.SerializeToString()
    return payload_bytes

def touchAsset(rfid):
    touch_action = TouchAssetAction(
    rfid = "",
    longitude = 2,
    latitude = 2,
    )

    touch_action.rfid = rfid

    touch_payload = Payload(
        action = 2,
        timestamp = _get_time(),
        touch_asset = touch_action,        
    )

    payload_bytes = touch_payload.SerializeToString()
    return payload_bytes

def packingTransactions(public_key, payload_bytes, signer):
    txn_header_bytes = TransactionHeader(
    family_name='lace',
    family_version='0.1',
    inputs=[addressing.NAMESPACE],
    outputs=[addressing.NAMESPACE],
    signer_public_key=public_key,
    # In this example, we're signing the batch with the same private key,
    # but the batch can be signed by another party, in which case, the
    # public key will need to be associated with that key.
    batcher_public_key=public_key,
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
        signer_public_key=public_key,
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

    output = open('lace.batches', 'wb')
    output.write(batch_list_bytes)

    print("Outputed batch file to 'lace.batches'.")


if __name__ == "__main__":
    #Make first agent
    print("\n**Creating First Agent**")
    payload_bytes, public_key, signer = createAgent("Sum Ting Wong")
    packingTransactions(public_key, payload_bytes, signer)
    os.system("curl --request POST   --header \"Content-Type: application/octet-stream\"  --data-binary @lace.batches    \"http://localhost:8008/batches\"")
    print("\n")
    #Make asset id
    tempRFID = _make_rfid()
    
    print("\n**Creating ASSET**\n")
    #make asset
    payload_bytes_asset = makeAsset(tempRFID)
    packingTransactions(public_key, payload_bytes_asset, signer)
    os.system("curl --request POST   --header \"Content-Type: application/octet-stream\"  --data-binary @lace.batches    \"http://localhost:8008/batches\"")
    
    print("\n\n**Creating Second Agent**")
    #Make second agent
    payload_bytes2, public_key2, signer2 = createAgent("Bang Ding Ow")
    packingTransactions(public_key2, payload_bytes2, signer2)
    os.system("curl --request POST   --header \"Content-Type: application/octet-stream\"  --data-binary @lace.batches    \"http://localhost:8008/batches\"")

    #time between switching hands on the asset
    time.sleep(15)

    print("\n\n**Touching Asset**")
    #Touch Asset
    payload_bytes_Touch = touchAsset(tempRFID)
    packingTransactions(public_key2, payload_bytes_Touch, signer2)
    os.system("curl --request POST   --header \"Content-Type: application/octet-stream\"  --data-binary @lace.batches    \"http://localhost:8008/batches\"")