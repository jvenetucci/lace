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
        '''     verbs -> action tags?
        action tags: 
            create_asset
            get_asset

        handler functions 
            _create_asset
            _get_asset

        how does signing work?

        A ShoePayload consists of a timestamp, an action tag, and
        attributes corresponding to various actions (create_asset,
        get_asset, etc).  The appropriate attribute will be selected
        depending on the action tag, and that information plus the 
        timestamp and the public key with which the transaction was signed
        will be passed to the appropriate handler function
        unpack_transaction gets the signing key, the timestamp, and the 
        appropriate payload attribute and handler function
        '''
        singer, timestamp, payload, handler = _unpack_transaction(transaction)

        handler(payload, signer, timestamp, state)
        

def _unpack_transaction(transaction):
    '''Return the transaction signing key, the SCPayload timestamp, the
    appropriate SCPayload action attribute, and the appropriate
    handler function (with the latter two determined by the constant
    TYPE_TO_ACTION_HANDLER table.
    '''
    signer = transaction.header.signer_public_key

    payload = SCPayload()
    payload.ParseFromString(transaction.payload)

    action = payload.action
    timestamp = payload.timestamp

    try:
        attribute, handler = TYPE_TO_ACTION_HANDLER[action]
    except KeyError:
        raise Exception('Specified action is invalid')

    payload = getattr(payload, attribute)

    return signer, timestamp, payload, handler


TYPE_TO_ACTION_HANDLER = { 
    SCPayload.CREATE_ASSET: ('create_asset', _create_agent),
    SCPayload.TOUCH_ASSET: ('touch_asset', _touch_asset),
}