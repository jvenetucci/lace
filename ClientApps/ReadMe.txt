These are the three sample frontend apps for interacting with the lace blockchain backend.
Each app is built by the main project docker file and are as follows:

The Owner Client:
* This app simulates the functions that the managing company might want to have.
* They add assets to the blockchain, can check the history of assets, and can accept delivery.
* app accessed at localhost:3001

The Factory Client:
* This app simulates the functions that the asset producing factory might need to have. 
* They can fullfil transactions begun by the Owner Client
* app accessed at localhost:3003

The Shipper Client:
* This app simulates the functions that shipping companies might need to have .
* They can accept assets from the factory or another shipper.
* app accessed at localhost:3002