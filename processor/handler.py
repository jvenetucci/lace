import logging
import hashlib

import cbor


from sawtooth_sdk.processor.handler import TransactionHandler
from sawtooth_sdk.processor.exceptions import InvalidTransaction
from sawtooth_sdk.processor.exceptions import InternalError


LOGGER = logging.getLogger(__name__)


VALID_VERBS = 'create' #, '...'  list of actions that can be done on shoe just use create for now

FAMILY_NAME = 'lace'

#INTKEY_ADDRESS_PREFIX = hashlib.sha512(            # uhmm addressing stuff
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
        ... = _unpack_transaction(transaction)

        state = _get_state_data(name, context)

        updated_state = _do_lace(...)

        _set_state_data(..., updated_state, context)


def _unpack_transaction(transaction):
    verb, name, value = _decode_transaction(transaction)

    _validate_verb(verb)
    ... # other validation functions not skeletoned 

    return verb ...


def _decode_transaction(transaction):
    try:
        content = cbor.loads(transaction.payload)
    except:
        raise InvalidTransaction('Invalid payload serialization')

    # correctly decode transaction
    try:
    except AttributeError:
        raise InvalidTransaction('... is required')

    return ... 


def _validate_verb(verb):
    if verb not in VALID_VERBS:
        raise InvalidTransaction('Verb must be ...')


# both state functions require more attention
def _get_state_data(name, context):
    address = make_intkey_address(name)

    state_entries = context.get_state([address])

    try:
        return cbor.loads(state_entries[0].data)
    except IndexError:
        return {}
    except:
        raise InternalError('Failed to load state data')


def _set_state_data(name, state, context):
    address = make_intkey_address(name)

    encoded = cbor.dumps(state)

    addresses = context.set_state({address: encoded})

    if not addresses:
        raise InternalError('State error')


def _do_lace(verb, name, value, state):  # rename this, its purpose is to determine the proper transaction handler
    verbs = {

    }

    try:
        return verbs[verb](name, value, state)
    except KeyError:
        # This would be a programming error.
        raise InternalError('Unhandled verb: {}'.format(verb))
