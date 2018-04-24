# Copyright Capstone Team B
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
# ------------------------------------------------------------------------------

from sawtooth_sdk.processor.core import TransactionProcessor

# Import needed handler files here
from handler import ShoeTransactionHandler
#from addressing import <something from addressing.py?>

# We'll try localhost as default
def add_handlers(processor=TransactionProcessor('tcp://localhost:4004')):
    # For each handler you want to add, you'll
    # create the handler object and call 
    # 'processor.add_handler(<object name>)

    # Handler initialization
    shoe = ShoeTransactionHandler()
    processor.add_handler(shoe)


# both state functions require more attention
def _get_state_data(name, context):
    #address = make_intkey_address(name)
    
    state_entries = context.get_state([address])

    try:
        return cbor.loads(state_entries[0].data)
    except IndexError:
        return {}
    except:
        raise InternalError('Failed to load state data')


def _set_state_data(name, state, context):
    # address = make_intkey_address(name)     how to address o.0

    encoded = cbor.dumps(state)

    addresses = context.set_state({address: encoded})

    if not addresses:
        raise InternalError('State error')


def _do_lace(verb, asset, state):  
    verbs = {
        'create': _do_create,
        'get'   : _do_get,
    }

    try:
        return verbs[verb](name, value, state)
    except KeyError:
        # This would be a programming error.
        raise InternalError('Unhandled verb: {}'.format(verb))

def _do_create(verb, asset, state):     # do we even have an asset here? would we unpack anything?

def _do_get(verb, asset, state):

