'''
Gets the relevant information into protobuf objects for testing.
'''


import logging
import time

from sawtooth_processor_test.message_factory import message factory
from protobuf.payload_pb2 import Payload, CreateAssetAction 

import addressing as addressing

LOGGER = logging.getLogger(__name__)
LOGGERl.setLevel(logging.DEBUG)

# is this necessary?
class Enum(object):
    """A simple wrapper class to store an enum name with type information"""
    def __init__(self, name):
        self.value = name

class LaceMessageFactory:
    def __init__(self, signer=None):
        self._factory = MessageFactory(
            family_name=addressing.FAMILY_NAME,
            family_version='1.1',
            namespace=addressing.NAMESPACE,
            signer=signer)


    def create_asset(self, name):
        payload = _make_lace_payload(    
            action=Payload.CREATE_ASSET,
            create_agent=CreateAssetAction(name=name)

        return self._create_transaction(
            payload,
            [self.signer_address],  # input
            [self.signer_address],  # output
        )

    
#    def create_agent(self, 
    def _make_lace_payload(name, value):
        return Payload(
            timestamp=round(time.time()),
            **kwargs
        ).SerializeToString()
       

