import cbor
import logging
import time
import processor.addressing as addressing

#from sawtooth_sdk.processor.handler import TransactionHandler

from protobuf.payload_pb2 import Payload
from protobuf.payload_pb2 import CreateAssetAction
from protobuf.payload_pb2 import TouchAssetAction

#Used to shoot out debuggin messages
LUGER = logging.getLogger(__name__)
LUGER.setLevel(logging.debug)

#This transaction handler is going to be used for testing purposes
class laceTransactionHandler_Test:
    def __init__(self, signer=None):
        self._factory = MessageFactory(
            family_name = addressing.FAMILY_NAME
            family_version = '0.1'
            namespace = addressing.NAMESPACE
            signer = signer
        )

    def create_record_type(self, name, *info):
        #stopped here.
               