import logging
import hashlib

import cbor


from sawtooth_sdk.processor.handler import TransactionHandler
from sawtooth_sdk.processor.exceptions import InvalidTransaction
from sawtooth_sdk.processor.exceptions import InternalError


LOGGER = logging.getLogger(__name__)


VALID_VERBS = 'create', 'get' # list of actions that can be done on shoe just use create for now

MAX_SHOE_SIZE = 60      # european xxl?
MIN_SHOE_SIZE = 1       # this should be covered by protobuff unsigned 

#INTKEY_ADDRESS_PREFIX = hashlib.sha512(            # uhmm addressing stuff moved to addressing.py
#    FAMILY_NAME.encode('utf-8')).hexdigest()[0:6]


class ShoeTransactionHandler(TransactionHandler):
    @property
    def family_name(self):
        return FAMILY_NAME

    @property
    def family_versions(self):
        return ['1.0']

    @property
    def namespaces(self):
        return [] # how to determine address prefix

    def apply(self, transaction, context):          
        verb, asset = _unpack_transaction(transaction)

        state = _get_state_data(asset.RFID, context)   # name => RFID possible?

        updated_state = _do_lace(verb, asset, state)

        _set_state_data(asset.RFID, updated_state, context)


def _unpack_transaction(transaction):
    verb, asset = _decode_transaction(transaction)

    _validate_verb(verb)
    _validate_asset(asset)
    # ...  other validation functions not skeletoned 

    return verb, asset


def _decode_transaction(transaction):
    try:
        content = cbor.loads(transaction.payload)
    except:
        raise InvalidTransaction('Invalid payload serialization')

    # correctly decode transaction
    try:
        verb = content['verb']
    except AttributeError:
        raise InvalidTransaction('verb is required')
    
    try:
        asset = content['asset']            # is this where magic happens? asset.size possible?
    except AttributeError:
        raise InvalidTransaction('asset is required')

    return verb, asset  


def _validate_verb(verb):
    if verb not in VALID_VERBS:
        raise InvalidTransaction("Verb must be 'create' or 'get'") 

# is this possible/desired?
def _validate_shoe_size_left(asset):
    if asset.shoesize < MAX_SHOE_SIZE or asset.shoesize > MIN_SHOE_SIZE:
        raise InvalidTransaction('Shoe size must be no larger than 60 or smaller than 1') 

def _validate_shoe_size_right(asset):
	return False;
	
def _validate_sku(asset):
	return False;
	
#def _validate_other_stuff
