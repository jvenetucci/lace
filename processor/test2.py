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

class TestLace():
    def __init__(self):
        self.usr0_prv_key = "3957568ed763a276a9c60bb1678cfe4c653f8039a9e592100fb28f0fa9e64351"
        self.usr1_prv_key = "13143ae71c154fb44d931d3745dd71d5541e189e00bc4d3aa2d53d69bfe7b421"
        self.usr2_prv_key = "41b6c45f8138da9e6c3e6978a67509fd01acfec753fc4dfdc1d5cd08a59ac551"
        self.bogus_prv_key = "03640e18e4f5d932236daa53e10f5e09609c8e21a8e71caaa4674ee35dfb4266bb"
        self.signer = secp256k1.PrivateKey()

    def create_agent(self, args):
        if len(args) < 1:
            print("\nA name is required to create an agent.\n")
            exit()

        usr_prv_key = ''
        if 2 < len(args):
            if args[2] == "usr0_prv_key":
                usr_prv_key = self.usr0_prv_key
            elif args[2] == "usr1_prv_key":
                usr_prv_key = self.usr1_prv_key
            elif args[2] == "usr2_prv_key":
                usr_prv_key = self.usr2_prv_key
            else:
                # Generate a bogus pub key that will fail at _verify_agent(state, public_key)
                usr_prv_key = self.bogus_prv_key
        else:
            # Generate a bogus pub key that will fail at _verify_agent(state, public_key)
            usr_prv_key = self.bogus_prv_key

        if 1 < len(args):
            name = args[1]
        else:
            name = "noname"

        # make the agent_payload, and specific attributes
        agent_action = CreateAgentAction(
                public_key = usr_prv_key,
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
        self.create_transaction(usr_prv_key, payload_bytes)


    def create_asset(self, args):
        # mandate having a public key here
        usr_prv_key = ''
        if len(args) <= 1:
            if args[1] == "usr0_prv_key":
                usr_prv_key = usr0_prv_key
            elif args[1] == "usr1_prv_key":
                usr_prv_key = usr1_prv_key
            elif args[1] == "usr2_prv_key":
                usr_prv_key = usr2_prv_key
            else:
                # Generate a bogus pub key that will fail at _verify_agent(state, public_key)
                usr_prv_key = bogus_prv_key
        else:
            # Generate a bogus pub key that will fail at _verify_agent(state, public_key)
            usr_prv_key = bogus_prv_key


        # make the asset_payload, and specific attributes
        asset_action = CreateAssetAction(
            rfid = _make_rfid(),
            size = "Mens 10",
            sku = "0 123456789 1",
            longitude = 1,
            latitude = 1,
        )

        asset_payload = Payload(
            action = 0,
            timestamp = _get_time(),
            create_asset = asset_action,        
        )

        # serialize before sending
        payload_bytes = asset_payload.SerializeToString()

        # Pack it all up and ship it out
        self.create_transaction(usr_prv_key, payload_bytes)

    #def touch_asset(self, args):


    def create_transaction(self, private_key, payload_bytes):
        self.signer.set_raw_privkey(bytes.fromhex(private_key))
        public_key = self.signer.pubkey.serialize().hex()

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
        txn_signature = self.signer.ecdsa_sign(txn_header_bytes)
        txn_signature_bytes = self.signer.ecdsa_serialize_compact(txn_signature)
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


        batch_signature = self.signer.ecdsa_sign(batch_header_bytes)
        batch_signature_bytes = self.signer.ecdsa_serialize_compact(batch_signature)
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



# Get arg from command line.
args = sys.argv[1:]

if len(args) <= 0:
    print("\nAn action is require:")
    print("test.py create_agent \"Your name\"")
    print("test.py create_asset <optional rfid>")
    print("test.py touch_asset <required rfid>\n")
    exit()
else:
    cmd = args[0]
    print(cmd)
    test = TestLace()
    x = getattr(test, cmd)(args)
    print(x)