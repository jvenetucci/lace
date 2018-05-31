# Copyright Capstone Team B
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
# ------------------------------------------------------------------------------


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
from protobuf.payload_pb2 import CreateAgentAction, TouchAssetAction, LockAssetAction, UnlockAssetAction
import addressing


def _get_time():
    return int(time.time())

def _make_rfid():
    rfid = str(uuid.uuid4()).replace("-", "")
    print("Generated RFID: '" + rfid + "'")
    return rfid


###### Important signer setup information ######
signer = secp256k1.PrivateKey()

# Paste a new private key as hex here.
#CUSTOM_KEY = "41b6c45f8138da9e6c3e6978a67509fd01acfec753fc4dfdc1d5cd08a59ac551"
CUSTOM_KEY = "8abb24b3c14cb80f84cd5e72048aaa9dd368174e0ce459b86ff91207ed440e07"
CUSTOM_KEY = "41b6c45f8138da9e6c3e6978a67509fd01acfec753fc4dfdc1d5cd08a59ac551"
#CUSTOM_KEY = "13143ae71c154fb44d931d3745dd71d5541e189e00bc4d3aa2d53d69bfe7b421"

# Comment out this next line to get a new key.
signer.set_raw_privkey(bytes.fromhex(CUSTOM_KEY))

private_key_bytes = signer.private_key
public_key_bytes = signer.pubkey.serialize()

public_key = public_key_bytes.hex()


# Mock lace opjects
agent_action = CreateAgentAction(
        public_key = public_key,
        name = "default name",
)

asset_action = CreateAssetAction(
    rfid = "",
    size = "Mens 10",
    sku = "0 123456789 1",
    longitude = 1,
    latitude = 1,
)

touch_action = TouchAssetAction(
    rfid = "",
    longitude = 2,
    latitude = 2,
)

lock_action = LockAssetAction(
    rfid = ""
)

unlock_action = UnlockAssetAction(
    rfid = ""
)


# Get arg from command line.
args = sys.argv[1:]

if len(args) <= 0:
    print("\nAn action is require:")
    print("test.py make_agent \"Your name\"")
    print("test.py make_asset <optional rfid>")
    print("test.py touch_asset <required rfid>\n")
    exit()
else:
    test = args[0]


if test == "make_agent":
    if len(args) <= 1:
        print("\nA name is required to create an agent.\n")
        exit()
    name = args[1]

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
    
elif test == "make_asset":
    if len(args) <= 1:
        rfid = _make_rfid()
    else:
        rfid = args[1]

    asset_action.rfid = rfid

    asset_payload = Payload(
        action = 0,
        timestamp = _get_time(),
        create_asset = asset_action,        
    )

    payload_bytes = asset_payload.SerializeToString()
   
elif test == "touch_asset":
    if len(args) <= 1:
        print("\nRFID is required to touch an asset.\n")
        exit()
    else:
        rfid = args[1]

    touch_action.rfid = rfid

    touch_payload = Payload(
        action = 2,
        timestamp = _get_time(),
        touch_asset = touch_action,        
    )

    payload_bytes = touch_payload.SerializeToString()

elif test == "lock_asset":
    if len(args) <= 1:
        print("\nRFID is required to touch an asset.\n")
        exit()
    else:
        rfid = args[1]

    lock_action.rfid = rfid

    lock_payload = Payload(
        action = 3,
        timestamp = _get_time(),
        lock_asset = lock_action,
    )

    payload_bytes = lock_payload.SerializeToString()

elif test == "unlock_asset":
    if len(args) <= 1:
        print("\nRFID is required to touch an asset.\n")
        exit()
    else:
        rfid = args[1]

    unlock_action.rfid = rfid

    unlock_payload = Payload(
        action = 4,
        timestamp = _get_time(),
        unlock_asset = unlock_action,
    )

    payload_bytes = unlock_payload.SerializeToString()
    
else:
    print("\nA valid action is require:")
    print("test.py make_agent \"Your name\"")
    print("test.py make_asset <optional rfid>")
    print("test.py touch_asset <required rfid>\n")
    exit()


# Pack it all up and ship it out.

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
