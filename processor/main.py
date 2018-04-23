# Make sure you are using sawtooth-sdk==1.0.1
# Version 1.0.2 does not include the protobuff modules

from sawtooth_sdk.processor.core import TransactionProcessor
from handler import pizzaTransactionHandler

# We need to define the address of the validator to connect to
# Best case is we take it from the command line, but for now its hard-coded
VALIDATOR_URL = 'tcp://validator:4004'

# Transaction processor are a long running process
# This main method creates and starts a processor.
# It does it by following these steps:
#   1. Create a new transaction processor
#   2. Create a new handler for that processor & attach it.
#   3. Start the processor
def main():
    # Create a new processor thats connect to the validator
    processor = TransactionProcessor(VALIDATOR_URL)

    # Create a handler and associate it with the processor
    handler = pizzaTransactionHandler()
    processor.add_handler(handler)

    # Start the processor
    # Provide an easy way to stop the processor with CTRL-C
    try:
        processor.start()
    except KeyboardInterrupt:
        print("Stopping pizzaTP....")
        processor.stop()
    finally:
        print("Stopping pizzaTP....")
        processor.stop()

main()