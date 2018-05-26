import logging
import time
import addressing as addr

from sawtooth_processor_test.message_factory import MessageFactory
from protobuf.payload_pb2 import Payload, CreateAgentAction, CreateAssetAction

LOGGER = logging.getLogger(__name__)
LOGGER.setLevel(logging.DEBUG)

class LaceMessageFactory:
    def __init__(self, signer=None):
        self._factory=MessageFactory(
            family_name=addr.FAMILY_NAME,
            family_version='0.1'
            namespace=addr.NAMESPACE,
            signer=signer)
        
        self.public_key = self._factory.get_public_key()
        self.signer_addr = addr.make_agent_address(self.public_key)

    def create_agent(self, name):
        payload = _make_Payload(
            action = 1,
            timestamp = int(time.time()),
            create_agent = CreateAgentAction = (
                public_key = self.public_key,
                name = name,
                role = 0)
        )

        return self._create_transaction(
            payload,
            [self.signer_addr],
            [self.signer_addr],
        )

    
    def create_asset(self, rfid, size, sku):
        payload = _make_Payload(
            action = 0,
            timestampe = int(time.time())
            create_record = CreateAssetAction(
                rfid = rfid,
                size = size,
                sku = sku,
                longitude = 0,
                latitude = 0
            )
        )
        
        make_asset = addr.make_asset_address(rfid)

        return self._create_transaction(
            payload,
            inputs=make_asset,
            outputs = make_asset
        )

    

    def _create_transaction(self, payload, inputs, outputs):
        return self._factory._create_transaction(payload, inputs, outputs, [])




def _make_Payload(**kwargs):
    return Payload(
        **kwargs
    ).SerializeToString()