import hashlib

def _hash(string):
    return hashlib.sha512(string.encode('utf-8')).hexdigest()

def _make_touchpoint_postfix(num):
    return hex(num)[2:].zfill(4)

# The first six characters of a History or Asset address are
# the first six characters of the transaction family ("lace")
# hashed.  The next character indicates if the object is a 
# history or asset.  ~~touchpoints?

FAMILY_NAME = 'lace'

NAMESPACE = _hash(FAMILY_NAME)[:6]

ASSET = '0'
HISTORY = '1'
AGENT = '2'

def make_asset_address(identifier):
    return (
        NAMESPACE
        + ASSET
        + _hash(identifier)[:59]    # what is identifier? rename this
        + '0000'
    )

def make_history_address(identifier):
    return (
        NAMESPACE
        + HISTORY
        + _hash(identifier)[:59]    # TF:6 + ID:1 + hash:59 + log:4
        + '0000'
    )

def make_touchpoint_address(identifier, index):
    return (
        NAMESPACE
        + HISTORY
        + _hash(identifier)[:59]    # TF:6 + ID:1 + hash:59 + log:4
        + _make_touchpoint_postfix(index) # index of the wanted touchpoint
    )

def make_agent_address(identifier): 
    return (
        NAMESPACE
        + AGENT
        + _hash(identifier)[:63]    # TF:6 + ID:1 + hash: 62
    )
    