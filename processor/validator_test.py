from sawtooth_processor_test.message_factory import
'''This test class assumes that a transaction processor has been set up
to connect to a certain address. It creates a mock validator that binds 
to that address (and closes the connection after all the tests have run)'''

from sawtooth_processor_test.message_factory import message_factory
from sawtooth_processor_test.transaction_processor_test_case import transaction_processor_test_case

class TestLace(TransactionProcessorTestCase):
    
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.factory = LaceMessageFactory()