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

    def send_empty_payload(self):
        return self._post_lace_transaction

    def _post_lace_transaction(self, transaction):
        return self.send_batches(
            self.factory.create_batch(
                transaction))

class TestSupplyChain(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        wait_for_rest_apis([REST_API]) # integration_tools.py

    def assert_valid(self, result):
        try:
            self.assertEqual("COMMITTED", result[1]['data'][0]['status'])
            self.assertIn('link', result[1])
        except AssertionError:
            raise AssertionError(
                'Transaction is unexpectedly invalid -- {}'.format(
                    result['data'][0]['invalid_transactions'][0]['message']))

    def assert_invalid(self, result):
        self.narrate('{}', result)
        try:
            self.assertEqual(
                'INVALID',
                result[1]['data'][0]['status'])
        except (KeyError, IndexError):
            raise AssertionError(
                'Transaction is unexpectedly valid')
                
    def narrate(self, message, *interpolations):
        if NARRATION:
            LOGGER.info(
                message.format(
                    *interpolations))

    def test_track_and_trade(self):
        jin = SupplyChainClient()

        self.assert_invalid(
            jin.send_empty_payload())

        
