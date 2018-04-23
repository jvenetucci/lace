import hashlib
import cbor
import logging
from sawtooth_sdk.processor.handler import TransactionHandler
from sawtooth_sdk.processor.context import Context
from sawtooth_sdk.processor.exceptions import InvalidTransaction

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
    #   - (1) Unpack the transaction that was sent from the client
    #   - (2) Get the current state of the blockchain
    #   - (3) Update the state with the info from the transaction
    #   - (4) Save the state.
    # 
    # There are two arguments:
    #   - transaction; From the client, what command to be executed and additional info; contains a header, signature, & payload
    #   - context; Object that can get/set/delete the current state. Interaction with the validator is all done through a Context Object.
    def apply(self, transaction, context):
        # STEP 1: UNPACK TRANSACTION
        # Unpack (decode) the transaction and get variables based on the action
        unpackedTxn = unpackTransaction(transaction)
        action = unpackedTxn['action']    # The client will either send us a 'create' or 'update'  action
        if (action == 'create'):
            orderID, custName, pizzaType, time = getCreateVariables(unpackedTxn)
        else:
            orderID, newStatus = getUpdateVariables(unpackedTxn)

        # Heres an example of validation
        if not isinstance(orderID, int):
            raise InvalidTransaction("Order ID must be a number")

        # Now what we want to do next is based on the action that the client sent
        #   If they wanted to create a new order, we check if it already exists, if not then create a new state object and write it
        #   If they wanted to update an order, we retrieve the state object, update, and write it
        # No matter the action, we usually have to do 3 things:
        #   1. Grab the current state
        #   2. Modify (or create) the state based on the action
        #   3. Write the state

        # STEP 2: UNPACK TRANSACTION
        # Get the current state
        stateList = getState(orderID, context)

        # STEP 3: MODIFY STATE
        # Now what we do with the state is up to the action
        # Whatever it is we want some new state to write back
        # To write state back, it needs to be stored as a dictionary where addresses are the keys and state objects are the values
        if (action == 'create'):
            stateDict = createNewOrder(stateList, orderID, custName, pizzaType, time)
        else:
            stateDict = updateOrder(stateList, orderID, newStatus)

        # STEP 4: WRITE STATE
        # Write the new state back to the validator
        context.set_state(stateDict)

# Decode the payload stored in the transaction
def unpackTransaction(transaction):
    try:
        data = cbor.loads(transaction.payload)
    except:
        raise InvalidTransaction("Error trying to deserialize payload")
    return data

# Grab the varaibles needed to create a new pizza from a decoded transaction payload
def getCreateVariables(unpackedTxn):
    try:
        orderId = unpackedTxn['orderID']
    except:
        raise InvalidTransaction("Order ID is missing")

    try:
        custName = unpackedTxn['custName']
    except:
        raise InvalidTransaction("Customer Name is missing")
    
    try:
        type = unpackedTxn['type']
    except:
        raise InvalidTransaction("Type of pizza is missing")

    try:
        time = unpackedTxn['time']
    except:
        raise InvalidTransaction("Time is missing")

    return orderId, custName, type, time

# Grab the varaibles needed to update a pizza from a decoded transaction payload
def getUpdateVariables(unpackedTxn):
    try:
        orderId = unpackedTxn['orderID']
    except:
        raise InvalidTransaction("Order ID is missing")

    try:
        newStatus = unpackedTxn['newStatus']
    except:
        raise InvalidTransaction("Status is missing")

    return orderId, newStatus

# Grab the state for an order using its order ID
# Returns a list of containing pairs of address:data
def getState(orderID, context):
    address = generateAddress(orderID)
    # getState takes in a list of addresses, and returns a list of entries [address:"", data:""]
    # In our context we are querying just one address, so our input list will contain 1 item
    # and we should get an empty list (state does not exit) or a list with 1 entry
    stateList = context.get_state([address])
    return stateList

# Create a new state for a pizza
# You should pass in the state list retrieved from getState()
# If the list is empty, then the pizza doesn't exist and we can create a new one!
#   otherwise there is already a pizza with that order ID and we should return an error
def createNewOrder(stateList, orderID, custName, type, time):
    if (len(stateList) != 0):
        raise InvalidTransaction("Order Number already exists")

    # Since the Order number is not in use, we can create a new state object
    # We encode the object to store it in state
    newOrder = cbor.dumps(createOrder(orderID, custName, type, time))

    # Remember that in order to write the state back, it needs to be stored as a dictionary, so we create a new object stateDict
    # The following syntax is a dictionary mapping --> {generateAddress(orderID) : newOrder}
    stateDict = {}
    stateDict[generateAddress(orderID)] = newOrder
    return stateDict

# Creates a new state object
# This is the stuff that is stored at each state node
def createOrder(orderNum, custName, type, time):
    return {
        'orderNum': orderNum,
        'custName': custName,
        'type': type,
        'time': time,
        'status': 'new'
    }

# Update an orders status
# There some logic here in how we assign pizza status,
#   A pizza must change status in the following order:
#       new -> prep -> oven -> ready
# Trying to change the status of a pizza to 'ready' when its current status is 'new' will result in an error
# Also you are unable to roll back status, Ex. trying to take a pizza in the oven back to prep
def updateOrder(stateList, orderID, newStatus):
    # First check if the stateList contained any entries
    # If its empty, that means that no order exists with the given order ID
    if (len(stateList) == 0):
        raise InvalidTransaction("Order Number does not exist")

    # Otherwise, grab the order from the state list and decode it
    order = cbor.loads(stateList[0].data)

    # Check to see if the new status we want to assign the order is inline with our 'business logic'
    validateStatusUpdate(newStatus, order['status'])

    # Update the status of the order
    order['status'] = newStatus

    # Encode the state object, and map it to the state address
    # Remember that in order to write the state back, it needs to be stored as a dictionary, so we create a new object stateDict
    # The following syntax is a dictionary mapping --> {generateAddress(orderID) : cbor.dump(order)}
    stateDict = {}
    stateDict[generateAddress(orderID)] = cbor.dumps(order)
    return stateDict

# Logic to check status assignments
def validateStatusUpdate(newStatus, currentStatus):
    if (newStatus == 'prep'):
        if (currentStatus != 'new'):
            raise InvalidTransaction("Trying to assign a status of 'prep' to a pizza with a status of " + currentStatus)
    elif (newStatus == 'oven'):
        if (currentStatus != 'prep'):
            raise InvalidTransaction("Trying to assign a status of 'oven' to a pizza with a status of " + currentStatus)
    elif (newStatus == 'ready'):
        if (currentStatus != 'oven'):
            raise InvalidTransaction("Trying to assign a status of 'ready' to a pizza with a status of " + currentStatus)
    else:
        raise InvalidTransaction("Trying to assign an unknown status: " + newStatus)

# Generates a 70 character block address
# The first 6 characters is the namespace prefix
# The remaining 64 are the last 64 characters of a hashing of the order ID
def generateAddress(orderID):
    hashData = hashlib.sha512(str(orderID).encode('utf-8'))    
    address = NAMESPACE_PREFIX + hashData.hexdigest()[-64:]
    return address 