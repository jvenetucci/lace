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
    lace = LaceTransactionHandler()
    processor.add_handler(lace)
