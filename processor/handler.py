import hashlib
import cbor
import logging
from sawtooth_sdk.processor.handler import TransactionHandler
from sawtooth_sdk.processor.context import Context
from sawtooth_sdk.processor.exceptions import InvalidTransaction

# Define a logger to print out debug messages
LOGGER = logging.getLogger(__name__)

# Define a name for this transaction family
FAMILY_NAME = 'pizzaTP'

# Define a namespace prefix for addressing used with this transaction processor
# Hash the FAMILY_NAME and take the first 6 characters of it
NAMESPACE_PREFIX = hashlib.sha512(FAMILY_NAME.encode('utf-8')).hexdigest()[0:6]


# This class is our transaction handler
# Remember there are 2 classes that we need to deal with when making a transaction family:
#   -Transaction Processor Core Class
#   -Transaction Processor Handler Class
# Sawtooth SDK gives us a generic Core Class to use,
# which leaves us to write the handler class.
class pizzaTransactionHandler(TransactionHandler):  # Note that the pizza handler is a subclass of TransactionHandler 
    @property
    def family_name(self):
        return FAMILY_NAME

    @property
    def family_versions(self):
        return ['0.1']

    @property
    def namespaces(self):
        return [NAMESPACE_PREFIX]

    # This is the big function of the Handler class.
    # The function is responsible for 'handling' any transactions that we send to the transaction processor (TP).
    # 
    # There are a few things this function needs to do
    #   - Unpack the transaction that was sent from the client
    #   - Get the current state of the blockchain
    #   - Update the state with the info from the transaction
    #   - Save the state.
    # 
    # There are two arguments:
    #   - transaction; From the client, what command to be executed and additional info; contains a header, signature, & payload
    #   - context; Object that can get/set/delete the current state. Interaction with the validator is all done through a Context Object.
    def apply(self, transaction, context):
        # Grab the signature of who sent this transaction
        # signature = transaction.header_signature

        # Unpack & validate the transaction into separate variables
        orderID, custName, pizzaType, time = unpackTransaction(transaction)

        # Heres an example of validation
        if not isinstance(orderID, int):
            raise InvalidTransaction("Order ID must be a number")

        # Get the current state of the blockchain
        stateList = getState(orderID, context)

        # Update the state
        # In thsi context there is none, so create a new one
        newOrder = cbor.dumps(createState(orderID, custName, pizzaType, time))
        
        stateList[generateAddress(orderID)] = newOrder
        print(stateList)

        # Save state
        context.set_state(stateList)

# Decode the payload stored in transaction
# Grab the individual information from the pyaload
def unpackTransaction(transaction):
    try:
        data = cbor.loads(transaction.payload)
    except:
        raise InvalidTransaction("Error trying to deserialize payload")

    print(data)

    try:
        orderId = data['orderID']
    except:
        raise InvalidTransaction("Order ID is missing")

    try:
        custName = data['custName']
    except:
        raise InvalidTransaction("Customer Name is missing")
    
    try:
        type = data['type']
    except:
        raise InvalidTransaction("Type of pizza is missing")

    try:
        time = data['time']
    except:
        raise InvalidTransaction("Time is missing")


    return orderId, custName, type, time

def getState(orderID, context):
    address = generateAddress(orderID)
    # getState takes in a list of addresses, and returns a list of data located at each address
    # In our context we are querying just one address
    stateList = context.get_state([address])

    # Since we are querying one address, our list should only contain 1 item
    # But (!) since we are 'creating' a new pizza, the list should be empty
    if (len(stateList) != 0):
        raise InvalidTransaction("Order Number already exists")

    return {}

def createState(orderNum, custName, type, time):
    return {
        'orderNum': orderNum,
        'custName': custName,
        'type': type,
        'time': time,
        'status': 'new'
    }

# Generates a 70 character block address
# The first 6 characters is the namespace prefix
# The remaining 64 are the last 64 characters of a hashing of the order ID
def generateAddress(orderID):
    hashData = hashlib.sha512(str(orderID).encode('utf-8'))    
    address = NAMESPACE_PREFIX + hashData.hexdigest()[-64:]
    return address 