import json
from base64 import b64decode
from urllib.request import urlopen
from urllib.error import HTTPError
from urllib.error import URLError
from http.client import RemoteDisconnected
import requests
import logging
import time
import unittest
import os
#from our module
import handler
import main
import secp256k1
import LaceMessageFactory
import addressing as addressing


#from sawtooth_sdk.processor.handler import TransactionHandler
from IntegrationTools import RestClient
from IntegrationTools import wait_for_rest_apis
from sawtooth_signing import create_context
from sawtooth_signing import CryptoFactory

from sawtooth_sdk.processor.core import TransactionProcessor
from sawtooth_processor_test.transaction_processor_test_case import TransactionProcessorTestCase
from sawtooth_processor_test.mock_validator import MockValidator

from protobuf.agent_pb2 import Agent, AgentContainer
from protobuf.asset_pb2 import Asset, AssetContainer
from protobuf.history_pb2 import History, HistoryContainer
from protobuf.history_pb2 import TouchPoint
from protobuf.payload_pb2 import Payload, CreateAssetAction

#Used to shoot out debuggin messages
LOGGER = logging.getLogger(__name__)
LOGGER.setLevel(logging.DEBUG)

URL = 'http://localhost:8008/batches'

class LaceClient(RestClient):
    def __init__(self, url = URL):
        context = create_context('secp256k1')
        private_key = context.new_random_private_key()
        signer = CryptoFactor(context).new_signer(private_key)
        self.factory = LaceMessageFactory(signer=signer)
        self.public_key = self.factory.public_key
        self.private_key = "encryptKEH"
        self.auth_token = None

        super().__init__(
            url=url,
            namespace=addressing.NAMESPACE
        )

    os.system('python3 test.py')

    def _post_transaction(self, transaction): 
        #add in lace.batches
        return self.send_batches(self.factory.create_batch(transaction))

    def send_empty_payload(self):
        return self._post_transaction(
            self.factory.make_empty_payload(
                self.public_key))
    
    #need to add the translating hex: example in test.py
    def create_agent(self, name):
        return self._post_transaction(
            self.factory.create_agent(name)
        )
    
    

class TestLace(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        wait_for_rest_apis(['localhost:8008'])

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
        Test = LaceClient()

    