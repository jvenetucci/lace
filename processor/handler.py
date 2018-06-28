# Team B is comprised of the following individuals:
#     - Roberto Avila
#     - Andrew Burnett
#     - Jeff De La Mare
#     - Nick Nation
#     - Phillip Nguyen
#     - Anthony Tran
#     - Joseph Venetucci

# [This program is licensed under the "MIT License"]
# Please see the file LICENSE.md in the 
# source distribution of this software for license terms.

# This software also makes use of Hyperledger Sawtooth which is
# licensed under Apache 2.0. A copy of it's license and copyright
# are contained in sawtooth-license.md and sawtooth-copyright.md 


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
    """ Contains business logic centered around asset transfers in a supply chain

    Three different entities exist when tracking an asset from one location
    to another.  There is an asset, an agent responsible for the asset, and the
    history of the asset.  This transaction handler deals with modifying the 
    global state for the lace transaction family. It is called by the Transaction
    Processor in main.
    """

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
        signer, timestamp, payload, handler = _unpack_transaction(transaction, state)

        handler(payload, signer, timestamp, state)

# Helper
def add_handlers(processor=TransactionProcessor('tcp://localhost:4004')):
    """ Creates handlers for the processor to call.  Used in main"""

    # For each handler you want to add, you'll
    # create the handler object and call 
    # 'processor.add_handler(<object name>)

    # Handler initialization
    lace = LaceTransactionHandler()
    processor.add_handler(lace)


# Handler functions

def _create_agent(payload, signer, timestamp, state):
    """ Creates an agent with public key, name, and role. 

    The position in the tree is determined by the addressing method used.  LaceTP identifies an 
    asset with a 6 character hash of the transaction family, followed by a single character to 
    indicate an agent(2), asset(1) or history(0).  All agents have this single character set
    to agent(2).  The remaining 63 characters of the merkel tree address is a hash of the agent's
    public key.
    """

    name = payload.name
    public_key = signer

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
        role = payload.role
    )

    container.entries.extend([agent])
    container.entries.sort(key=lambda ag: ag.public_key)

    _set_container(state, address, container)


def _create_asset(payload, signer, timestamp, state):
    """Creates a history and initial touchpoint for an asset. 

    The position in the tree is determined by the addressing method used.  LaceTP identifies an 
    asset with a 6 character hash of the transaction family, followed by a single character to 
    indicate an agent(2), asset(1) or history(0).  All touchpoints have this single character set
    to asset(1).  Between this character and the last four (59 chars) is a random hash of an rfid.  
    The final four characters indicate the touchpoint index.  The index can never be zero as that 
    is reserved for the history.  The touchpoint can wrap around zero.
    """

    _verify_agent(state, signer)

    rfid = payload.rfid


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


def _touch_asset(payload, signer, timestamp, state):
    """ Adds a touchpoint to the list of existing touchpoints for a given asset.

    The position in the tree is determined by the addressing method used.  LaceTP identifies an 
    asset with a 6 character hash of the transaction family, followed by a single character to 
    indicate an agent(2), asset(1) or history(0).  All touchpoints have this single character set
    to asset(1).  The final betweent this character and the final four is a random hash of 59 
    characters.  The final four characters indicate the touchpoint index.  The index can never be
    zero as that is reserved for the history.  The touchpoint can wrap around zero.
    """

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

    # Check for a lock
    if history.locked:
        raise InvalidTransaction(
            'Asset is locked. You must unlock it or request that it be unlocked.')

    # Find the correct reporter index or loop out.
    reporter_count = INITIAL_REPORTER_INDEX
    reporter_index = -1     # reporter does not exist
    for reporter in history.reporter_list:
        if reporter.public_key == signer:
            reporter_index = reporter_count
        reporter_count += 1

    touchpoint = TouchPoint (
            longitude = payload.longitude,
            latitude  = payload.latitude,
            reporter_index = INITIAL_REPORTER_INDEX,
            timestamp = timestamp,
    )
   
    # Check if we need to create a new reporter list entry.
    if reporter_index == -1:    # then it wasn't found
        reporter = Reporter(
            public_key = signer,
            authorization_level = DEFAULT_AUTH_LEVEL,
        )

        history.reporter_list.extend([reporter])
        touchpoint.reporter_index = len(history.reporter_list) - 1
    else:
        touchpoint.reporter_index = reporter_index

    # Calculate index, considering that it may wrap around.
    if history.curr_touchpoint_index == MAX_TOUCH_POINT:
        history.has_wrapped = True
        history.curr_touchpoint_index = INITIAL_TOUCHPOINT_INDEX
    else:
        history.curr_touchpoint_index += 1

    address = addressing.make_touchpoint_address(rfid, history.curr_touchpoint_index)
  
    container = _get_container(state, address)

    if len(container.entries) > 0:
        del container.entries[:]
        container.entries.extend([touchpoint])
    else:
        container.entries.extend([touchpoint])

    _set_container(state, address, container)
    _set_container(state, history_address, history_container)

def _lock_asset(payload, signer, timestamp, state):
    """ Prevents an asset from being touched by locking it.

    To lock an asset, an rfid must be provided by the agent who last
    held it.  Locking sets the locked field in history to true, and 
    prevents further touchpoints being added to state without unlocking.
    """

    _verify_agent(state, signer)
    rfid = payload.rfid

    if not rfid:
        raise InvalidTransaction(
            'RFID needed to lock asset.')

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

    touchpoint_index = history.curr_touchpoint_index
    touchpoint_address = addressing.make_touchpoint_address(rfid, touchpoint_index)
    touchpoint_container = _get_container(state, touchpoint_address)

    try:
        touchpoint = touchpoint_container.entries[0]
    except:
        raise InvalidTransaction('Unable to get needed touchpoint.')

    last_reporter = history.reporter_list[touchpoint.reporter_index]

    if not last_reporter.public_key == signer:
        raise InvalidTransaction('Not authorized to lock this asset.')

    history.locked = True

    _set_container(state, history_address, history_container)


def _unlock_asset(payload, signer, timestamp, state):
    """ Unlocks an asset to allow new touchpoints being created

    An agent needs the authorization to unlock an asset.  The credentials 
    lie with the last reported holder of the object. 
    """
   
    _verify_agent(state, signer)
    rfid = payload.rfid

    if not rfid:
        raise InvalidTransaction(
            'RFID needed to lock asset.')

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

    touchpoint_index = history.curr_touchpoint_index
    touchpoint_address = addressing.make_touchpoint_address(rfid, touchpoint_index)
    touchpoint_container = _get_container(state, touchpoint_address)

    try:
        touchpoint = touchpoint_container.entries[0]
    except:
        raise InvalidTransaction('Unable to get needed touchpoint.')

    last_reporter = history.reporter_list[touchpoint.reporter_index]

    # if not last_reporter.public_key == signer:
    #     raise InvalidTransaction('Not authorized to unlock this asset.')

    history.locked = False

    _set_container(state, history_address, history_container)
    

# Utility functions

def _unpack_transaction(transaction, state):
    """Return the transaction signing key, the SCPayload timestamp, the
    appropriate SCPayload action attribute, and the appropriate
    handler function (with the latter two determined by the constant
    TYPE_TO_ACTION_HANDLER table.
    """ 

    signer = transaction.header.signer_public_key

    payload_header = Payload()
    payload_header.ParseFromString(transaction.payload)

    action = payload_header.action
    timestamp = payload_header.timestamp

    try:
        attribute, handler = TYPE_TO_ACTION_HANDLER[action]
    except KeyError:
        raise Exception('Specified action is invalid')

    payload = getattr(payload_header, attribute)

    company = {
        Payload.CREATE_AGENT:True,
        Payload.CREATE_ASSET:True,
        Payload.TOUCH_ASSET:True,
        Payload.LOCK_ASSET:True,
        Payload.UNLOCK_ASSET:True,
    }

    factory = {
        Payload.CREATE_AGENT:True,
        Payload.CREATE_ASSET:True,
        Payload.TOUCH_ASSET:True,
        Payload.LOCK_ASSET:True,
        Payload.UNLOCK_ASSET:True,
    }

    shipper = {
        Payload.CREATE_AGENT:True,
        Payload.CREATE_ASSET:False,
        Payload.TOUCH_ASSET:True,
        Payload.LOCK_ASSET:False,
        Payload.UNLOCK_ASSET:False,
    }

    if action == Payload.CREATE_AGENT:
        return signer, timestamp, payload, handler

    if action not in company:
        raise InvalidTransaction('\'' + action + '\' is not a valid action.')

    agent_role = _get_Agent_Role(state, signer)

    if agent_role <= 0 and (not company[action]):
        raise InvalidTransaction('Not authorized to perform this action.')
    elif agent_role == 1 and (not factory[action]):
        raise InvalidTransaction('Not authorized to perform this action.')
    elif agent_role >= 2 and (not shipper[action]):
        raise InvalidTransaction('Not authorized to perform this action.')

    return signer, timestamp, payload, handler


def _get_container(state, address):
    """ Dynamically chooses the appropriate container and grabs current state. """
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
    """ Updates the state once any given handler has run."""

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
    """ Verify that public_key has been registered as an agent """
    address = addressing.make_agent_address(public_key)
    container = _get_container(state, address)
    
    if all(agent.public_key != public_key for agent in container.entries):
        raise InvalidTransaction(
            'Agent must be registered to perform this action')

def _get_Agent_Role(state, public_key):
    """ Find an agent's role attribute and return it."""
    address = addressing.make_agent_address(public_key)
    container = _get_container(state, address)

    try:
        agent = next(
            entry
            for entry in container.entries
            if entry.public_key == public_key
        )
    except StopIteration:
        raise InvalidTransaction(
            'No agent found.')

    return agent.role


TYPE_TO_ACTION_HANDLER = { 
    Payload.CREATE_AGENT: ('create_agent', _create_agent),
    Payload.CREATE_ASSET: ('create_asset', _create_asset),
    Payload.TOUCH_ASSET: ('touch_asset', _touch_asset),
    Payload.LOCK_ASSET: ('lock_asset', _lock_asset),
    Payload.UNLOCK_ASSET: ('unlock_asset', _unlock_asset),
}
