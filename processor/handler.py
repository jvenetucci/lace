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

import cbor

from sawtooth_sdk.processor.handler import TransactionHandler
from sawtooth_sdk.processor.exceptions import InvalidTransaction
from sawtooth_sdk.processor.exceptions import InternalError

# Lace protos
from protobuf.agent_pb2 import Agent, AgentContainer
from protobuf.asset_pb2 import Asset, AssetContainer
from protobuf.history_pb2 import History, HistoryContainer
from protobuf.history_pb2 import TouchPoint
from protobuf.payload_pb2 import Payload

# Sawtooth addressing specs
import addressing as addressing


LOGGER = logging.getLogger(__name__)

MAX_SHOE_SIZE = 60      # european xxl?
MIN_SHOE_SIZE = 1       # this should be covered by protobuff unsigned 

class LaceTransactionHandler(TransactionHandler):
    @property
    def family_name(self):
        return addressing.FAMILY_NAME

    @property
    def family_versions(self):
        return ['0.1']

    @property
    def namespaces(self):
        return [] # how to determine address prefix

    def apply(self, transaction, context):          
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
        singer, timestamp, payload, handler = _unpack_transaction(transaction)

        handler(payload, signer, timestamp, state)


# Handler functions

def _create_agent(payload, signer, timestamp, state):
    first_name = payload.first_name
    last_name = payload.last_name
    if not first_name and last_name:
        raise InvalidTransaction(
            'No name was provided'
        )

    address = addressing.make_agent_address(signer)
    container = _get_container(state, address)

    for agent in container.entries:
        if agent.public_key == signer:
            raise InvalidTransaction(
                'Agent already exists'
            )

    new_person = Agent(
        public_key = signer,
        first_name = first_name,
        last_name = last_name,
        role = 0,
    )
    container.entries.extend([new_person])
    container.entries.sort(key=lambda ag: ag.public_key)

    _set_container(state, address, container)
    #print("Create agent body goes here.")

def _create_asset(payload, signer, timestamp, state):
    rfid = payload.rfid
    
    if not rfid:
        raise InvalidTransaction('Asset must have rfid')

    address = make_asset_address(rfid)    # signer = transaction.header.signer_public_key
    container = _get_container(state, address)

    for asset in container.entries:      
        if asset.rfid == rfid:
            raise InvalidTransaction(
                'Asset already exists')
    
    asset = Asset(  #don't know if these fields are correct
        rfid    = payload.rfid,
        size_r  = payload.size_r,
        size_l  = payload.size_l,
        sku     = payload.sku, 
        timestamp=timestamp,
    )

    # list.extend over iterable list asset appends asset to container.entries
    container.entries.extend([asset])   
    # returns new sorted list anon function I think ag is a parameter ag.public_key is an expression
    # lambda arguments: expression yields a function object that looks like
        # def <lambda>(arguments):
            # return expression
    # key specifies a function to use for comparison, it looks like we're ordering by public_key
    #     
    _set_container(state, address, container)


# starting to think this should be done with history?
def _touch_asset(payload, signer, timestamp, state):
    rfid = payload.rfid

    if not rfid:
        raise InvalidTransaction(
            'Asset must have rfid')

    try:
        history = _get_history()           #(history, history_container, history_address)
    except:
        raise InvalidTransaction(
            "Unable to get history")

    history.curr_touchpoint_index 
    
    reporter_index = 0
    for reporter in history.reporter_list:
        if reporter.public_key == signer:
            break
        reporter_index += 1

    touchpoint = TouchPoint (
            longitude = payload.longitude,
            latitude  = payload.latitude,
            reporter_index = 0,
            timestamp = timestamp,
    )

    if reporter_index == history.reporter_list.len() - 1:
        reporter = Reporter (
            public_key = signer,
            authorization_level = 0,
        )
        history.reporter_list.extend(reporter)
        touchpoint.reporter_index = history.reporter_list.len() - 1
    else:
        touchpoint.reporter_index = reporter_index
    
    # update lat, long, timestamp
    # reporter in index?
    # 

    # find current touchpoint? 
    # wrapping
    #if current tp == max_touch TouchPoint   
        #make_tp_addr = (rfid, 1)
    #else 
        #make tp addr = (rfid, current tp + 1)

def _get_agent(state, agent_id):
    if not agent_id:
        raise InvalidTransaction(
            'No Id was provided'
        )
    address = addressing.make_agent_address(agent_id)
    container = _get_container(state, address)

    try:
        agent = next(
            agent
            for agent in container.entries
            if agent.public_key == agent_id
        )
    except StopIteration:
        raise InternalError(
            'Person does not exist'
        )
    
    return agent, address, container
    #print("Get agent body goes here.")


def _get_asset(state, asset_id):
    ''' Return asset, asser_container, asset_address '''
    if not asset_id:
        raise InvalidTransaction(
            'Asset must have id')
    
    asset_address = addressing.make_asset_address(asset_id)
    asset_container = _get_container(state, asset_address)

    try:
        asset = next(
            asset
            for asset in asset_container.entries
            if asset.rfid == asset_id
        )
    except StopIteration:
        raise InvalidTransaction(
            'Asset does not exist')

    return asset, asset_container, asset_address


def _get_history(state, asset_id):
    ''' Return history, history_container, history_address '''
    if not asset_id:
        raise InvalidTransaction(
            'History must have id')
    
    history_address = addressing.make_history_address(asset_id)
    history_container = _get_container(state, history_address)

    try:
        history = next(
            history
            for history in history_container.entries
            if history.rfid == asset_id
        )
    except StopIteration:
        raise InvalidTransaction(
            'History does not exist')

    return history, history_container, history_container

def _get_touchpoint(state, asset_id, index):
    ''' Return touchpoint, touchpoint_address '''
    if (not asset_id) or (not index):
        raise InvalidTransaction(
            'Invalid invocation')

    touchpoint_address = addressing.make_touchpoint_address(asset_id, index)
    touchpoint_container = _get_container(state, touchpoint_address)

    try:
        touchpoint = touchpoint_container[0]
    except:
        raise InvalidTransaction(
            'Touchpoint does not exist')

    return touchpoint, touchpoint_address

# Utility functions

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
    addresses = state.set_state({
        address: container.SerializeToString()
    })

    if not addresses:
        raise InternalError(
            'State error, failed to set state entities')


TYPE_TO_ACTION_HANDLER = { 
    Payload.CREATE_AGENT: ('create_agent', _create_agent),
    Payload.CREATE_ASSET: ('create_asset', _create_asset),
    Payload.TOUCH_ASSET: ('touch_asset', _touch_asset),
    Payload.GET_AGENT: ('get_agent', _get_agent),
    Payload.GET_ASSET: ('get_asset', _get_asset),
    Payload.GET_HISTORY: ('get_history', _get_history),
}