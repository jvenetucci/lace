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

import logging
import hashlib

# Sawtooth SDK
from sawtooth_sdk.processor.core import TransactionProcessor
from sawtooth_sdk.processor.handler import TransactionHandler
from sawtooth_sdk.processor.exceptions import InvalidTransaction
from sawtooth_sdk.processor.exceptions import InternalError

# Lace protos
from protobuf.agent_pb2 import Agent, AgentContainer
from protobuf.asset_pb2 import Asset, AssetContainer
from protobuf.history_pb2 import History, HistoryContainer, Reporter
from protobuf.history_pb2 import TouchPoint, TouchPointContainer
from protobuf.payload_pb2 import Payload

# Lace addressing specs
import addressing


LOGGER = logging.getLogger(__name__)

MAX_TOUCH_POINT = 16 ** 4 - 1
DEFAULT_ROLE = 0
DEFAULT_AUTH_LEVEL = 0
INITIAL_TOUCHPOINT_INDEX = 1
INITIAL_REPORTER_INDEX = 0

class LaceTransactionHandler(TransactionHandler):
    @property
    def family_name(self):
        return addressing.FAMILY_NAME

    @property
    def family_versions(self):
        return ['0.1']

    @property
    def namespaces(self):
        return [addressing.NAMESPACE] # how to determine address prefix

    def apply(self, transaction, state):
        '''
        A Payload consists of a timestamp, an action tag, and
        attributes corresponding to various actions (create_asset,
        touch_asset, etc).  The appropriate attribute will be selected
        depending on the action tag, and that information plus the 
        timestamp and the public key with which the transaction was signed
        will be passed to the appropriate handler function
        unpack_transaction gets the signing key, the timestamp, and the 
        appropriate payload attribute and handler function
        '''
        # TO DO : check that timestamp is valid before calling handler.
        signer, timestamp, payload, handler = _unpack_transaction(transaction)

        handler(payload, signer, timestamp, state)

# Helper
def add_handlers(processor=TransactionProcessor('tcp://localhost:4004')):
    # For each handler you want to add, you'll
    # create the handler object and call 
    # 'processor.add_handler(<object name>)

    # Handler initialization
    lace = LaceTransactionHandler()
    processor.add_handler(lace)


# Handler functions

def _create_agent(payload, signer, timestamp, state):
    name = payload.name
    public_key = payload.public_key

    if not name:
        raise InvalidTransaction(
            'Must provide agent name.'
        )

    if not public_key:
        raise InvalidTransaction(
            'Public key is required.')

    address = addressing.make_agent_address(public_key)
    container = _get_container(state, address)

    if any(agent.public_key == public_key for agent in container.entries):
        raise InvalidTransaction(
                'Agent already exists.')

    agent = Agent(
        public_key = public_key,
        name = name,
    )

    container.entries.extend([agent])
    container.entries.sort(key=lambda ag: ag.public_key)

    _set_container(state, address, container)


def _create_asset(payload, signer, timestamp, state):
    _verify_agent(state, signer)

    rfid = payload.rfid

    
    if not rfid:
        raise InvalidTransaction('Asset must have rfid.')

    asset_address = addressing.make_asset_address(rfid)
    asset_container = _get_container(state, asset_address)

    if any(asset.rfid == rfid for asset in asset_container.entries):
        raise InvalidTransaction(
                'Asset already exists')

    # Create the asset and extend the asset container.
    
    asset = Asset(
        rfid    = payload.rfid,
        size    = payload.size,
        sku     = payload.sku, 
    )

    asset_container.entries.extend([asset])

    # Create the history for the asset.

    history_address = addressing.make_history_address(rfid)
    history_container = _get_container(state, history_address)

    if any(history.rfid == rfid for history in history_container.entries):
        raise InvalidTransaction(
                'History already exists for asset that didn\'t...')

    history = History(
        rfid = rfid,
        curr_touchpoint_index = INITIAL_TOUCHPOINT_INDEX,
        has_wrapped = False,
    )

    history.reporter_list.extend([
        Reporter(
            public_key          = signer,
            authorization_level = DEFAULT_AUTH_LEVEL, # Default for now.
        )
    ])

    # Extend the history container
    history_container.entries.extend([history])

    # Create the initial touchpoint

    touchpoint_address = addressing.make_touchpoint_address(rfid, INITIAL_TOUCHPOINT_INDEX)
    touchpoint_container = _get_container(state, touchpoint_address)

    touchpoint = TouchPoint(
        longitude = payload.longitude,
        latitude = payload.latitude,
        timestamp = timestamp,
        reporter_index = INITIAL_REPORTER_INDEX,
    )

    # Extend touchpoint container.
    touchpoint_container.entries.extend([touchpoint])

    # Set the state for the asset and its history.
    _set_container(state, asset_address, asset_container)
    _set_container(state, history_address, history_container)
    _set_container(state, touchpoint_address, touchpoint_container)

    # list.extend over iterable list asset appends asset to container.entries

    # returns new sorted list anon function I think ag is a parameter ag.public_key is an expression
    # lambda arguments: expression yields a function object that looks like
        # def <lambda>(arguments):
            # return expression
    # key specifies a function to use for comparison, it looks like we're ordering by public_key
    #     



def _touch_asset(payload, signer, timestamp, state):
    _verify_agent(state, signer)

    rfid = payload.rfid

    if not rfid:
        raise InvalidTransaction(
            'Asset must have rfid.')

    # Get the asset history.

    history_address = addressing.make_history_address(rfid)
    history_container = _get_container(state, history_address)

    try:
        history = next(
            entry
            for entry in history_container.entries
            if entry.rfid == rfid
        )
    except StopIteration:
        raise InvalidTransaction(
            'History could not be found. Asset likely doesn\'t exist.')
    
    # Find the correct reporter index or loop out.
    reporter_index = INITIAL_REPORTER_INDEX
    for reporter in history.reporter_list:
        if reporter.public_key == signer:
            break
        reporter_index += 1

    touchpoint = TouchPoint (
            longitude = payload.longitude,
            latitude  = payload.latitude,
            reporter_index = INITIAL_REPORTER_INDEX,
            timestamp = timestamp,
    )

    # Check if we need to create a new reporter list entry.
    if reporter_index == len(history.reporter_list):
        reporter = Reporter(
            public_key = signer,
            authorization_level = DEFAULT_AUTH_LEVEL,
        )
        history.reporter_list.extend(reporter)
        touchpoint.reporter_index = history.reporter_list.len() - 1
    else:
        touchpoint.reporter_index = reporter_index

    # Calculate index, considering that it may wrap around.
    if history.curr_touchpoint_index == MAX_TOUCH_POINT:
        address = addressing.make_touchpoint_address(rfid, INITIAL_TOUCHPOINT_INDEX)
    else:
        address = addressing.make_touchpoint_address(rfid, history.curr_touchpoint_index + 1)
  
    container = _get_container(state, address)

    if len(container.entries) > 0:
        del container.entries[:]
        container.entries.extend([touchpoint])
    else:
        container.entries.extend([touchpoint])

    _set_container(state, address, container)


# Utility functions

def _unpack_transaction(transaction):
    '''Return the transaction signing key, the SCPayload timestamp, the
    appropriate SCPayload action attribute, and the appropriate
    handler function (with the latter two determined by the constant
    TYPE_TO_ACTION_HANDLER table.
    '''
    signer = transaction.header.signer_public_key

    payload = Payload()
    payload.ParseFromString(transaction.payload)

    action = payload.action
    timestamp = payload.timestamp

    try:
        attribute, handler = TYPE_TO_ACTION_HANDLER[action]
    except KeyError:
        raise Exception('Specified action is invalid')

    payload = getattr(payload, attribute)

    return signer, timestamp, payload, handler


def _get_container(state, address):
    namespace = address[6:7]

    containers = {
        addressing.ASSET: AssetContainer,  
        addressing.HISTORY: (HistoryContainer
                              if address[-4:] == '0000'
                              else TouchPointContainer),
        addressing.AGENT: AgentContainer,
    }

    # uses namespace to choose Asset or History
    container = containers[namespace]() # why the (), c
    
    entries = state.get_state([address])    # API call, entries 

    if entries:
        data = entries[0].data          # get the first address in a list of them
        container.ParseFromString(data) # it looks like some encoded data

    return container    


def _set_container(state, address, container):
    try:
        addresses = state.set_state({
        address: container.SerializeToString()
        })
        if not addresses:
            raise InternalError(
                'State error, failed to set state entities')
    except:
        raise InternalError(
            'State error, likely using wrong in/output fields in tx header.')


def _verify_agent(state, public_key):
    ''' Verify that public_key has been registered as an agent '''
    address = addressing.make_agent_address(public_key)
    container = _get_container(state, address)

    if all(agent.public_key != public_key for agent in container.entries):
        raise InvalidTransaction(
            'Agent must be registered to perform this action')


TYPE_TO_ACTION_HANDLER = { 
    Payload.CREATE_AGENT: ('create_agent', _create_agent),
    Payload.CREATE_ASSET: ('create_asset', _create_asset),
    Payload.TOUCH_ASSET: ('touch_asset', _touch_asset),
}