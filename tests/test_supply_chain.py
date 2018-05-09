import json
import logging
import unittest

from sawtooth_integration.tests.integration_tools import RestClient
from sawtooth_integration.tests.integration_tools import wait_for_rest_apis

from sawtooth_sc_test.supply_chain_message_factory import \
    SupplyChainMessageFactory
from sawtooth_signing import create_context
from sawtooth_signing import CryptoFactory

import supply_chain_processor.addressing as addressing
from supply_chain_processor.protobuf.property_pb2 import PropertySchema
from supply_chain_processor.protobuf.proposal_pb2 import Proposal
from supply_chain_processor.protobuf.payload_pb2 import AnswerProposalAction


LOGGER = logging.getLogger(__name__)
LOGGER.setLevel(logging.DEBUG)

NARRATION = False


REST_API = 'rest-api:8008'
URL = 'http://' + REST_API

SERVER_URL = 'http://supply-server:3000'
API = SERVER_URL


class SupplyChainClient(RestClient):
    def __init__(self, url=URL):
        context = create_context('secp256k1')
        private_key = context.new_random_private_key()
        signer = CryptoFactory(context).new_signer(private_key)
        self.factory = SupplyChainMessageFactory(signer=signer)
        self.public_key = self.factory.public_key
        self.private_key = "encryptedKey"
        self.auth_token = None

        super().__init__(
            url=url,
            namespace=addressing.NAMESPACE)