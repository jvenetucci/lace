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

from protobuf.asset_pb2 import Asset, AssetContainer

from sawtooth_sdk.processor.core import TransactionProcessor

# Import needed handler files here
from handler import LaceTransactionHandler
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


def _create_asset(payload, signer, timestamp, state):     
	rfid = payload.rfid

    if not rfid:
        raise InvalidTransaction(
            'Asset must have rfid')

    address = make_asset_address(signer)    # signer = transaction.header.signer_public_key
    container = _get_container(state, address)

    for asset in container.entries:     # 
        if asset.public_key == signer:
            raise InvalidTransaction(
                'Asset already exists')
    
    asset = Asset(  #don't know if these fields are correct
        rfid      = payload.rfid,
        size_l    = payload.size_l,
        size_r    = payload.size_r,
        sku       = payload.sku,
        longitude = payload.longitude,
        latitude  = payload.latitude,
        )

    # list.extend over iterable list asset appends asset to container.entries
    container.entries.extend([asset])   
    # returns new sorted list anon function I think ag is a parameter ag.public_key is an expression
    # lambda arguments: expression yields a function object that looks like
        # def <lambda>(arguments):
            # return expression
    # key specifies a function to use for comparison, it looks like we're ordering by public_key
    container.entries.sort(key=lambda, ag: ag.rfid)
    
    _set_container(state, address, container)


# starting to think this should be done with history?
def _touch_asset(payload, signer, timestamp, state):
    rfid = payload.rfid

    if not rfid:
        raise InvalidTransaction(
            'Asset must have rfid')

    address = make_asset_address(signer)
    container = _get_container(state, address)

    for asset in container.entries:
        if not asset.public_key == signer:
            raise InvalidTransaction(
                'Asset does not exist')
            
    # make new history page

    # get the 



def _get_container(state, address):
    namespace = address[6:7]

    containers = {
        addressing.ASSET: AssetContainer,  
        addressing.HISTORY: HistoryContainer,
    }

    # uses namespace to choose Asset or History
    container = containers[namespace]() # why the (), c
    
    # 
    entries = state.get_state([address])    # API call, entries 

    if entries:
        data = entries[0].data          # get the first address in a list of them
        container.ParseFromString(data) # it looks like some encoded data

    return container    

def _set_container(state, address, container):
    addresses: state.set_state({
        address: container.SerializeToString()
    })

    if not addresses:
        raise InternalError(
            'State error, failed to set state entities')

#standup 1.create_asset local branch 2.get state 3.container magic
