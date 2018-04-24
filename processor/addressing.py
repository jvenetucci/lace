import hashlib

def _hash(string)
    return hashlib.sha512(string.encode('utf-8')).hexdigest()

# The first six characters of a History or Asset address are
# the first six characters of the transaction family ("lace")
# hashed.  The next character indicates if the object is a 
# history or asset.  ~~touchpoints?

FAMILY_NAME = 'lace'

NAMESPACE = _hash(FAMILY_NAME)[:6]

ASSET = '0'
HISTORY = '1'

def make_asset_address(identifier):
    return (
        NAMESPACE
        + ASSET
        + _hash(identifier):[59]    # what is identifier?
        + '0000'
    )

def make_history_address(identifier):
    return (
        NAMESPACE
        + HISTORY
        + _hash(identifier):[59]
        + '0000'
    )
