class TestLace(TransactionProcessorTestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cli.factory = LaceMessageFactory()
        
    def test_create_asset(self):


def validator_sends_tp_process_request(self, *args, **kwargs):
    self.validator.send(
        self.factory.create_tp_process_request(*args, **kwargs))

def validator_expects_get_request(self, key):
    return self.validator.expect(
        self.factory.create_get_request(key))

def validator_responds_to_get_request(self, message, *args, **kwargs):
    self.validator.respond(
        self.factory.create_get_response(*args, **kwargs), message)

def validator_expects_set_request(self, *args, **kwargs):
    return self.validator.expect(
        self.factory.create_set_request(*args, **kwargs))

def validator_responds_to_set_request(self, message, *args, **kwargs):
    self.validator.respond(
        self.factory.create_set_response(*args, **kwargs), message)

def validator_expects_tp_response(self, status):
    return self.validator.expect(
        self.factory.create_tp_response(status))