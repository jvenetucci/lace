# lace
## How to run
1. Run docker-compose -f sawtooth-default.yaml up
2. New terminal window
3. Navigate to /client
4. Run node submit.js [action] [args]

## Troubleshoot -- Docker
If you're having issues creating the second block (after genesis)
try the follow:

docker-compose -f sawtooth-default.yaml up --force-recreate

## Troubleshoot -- Node
If you try to run the client, you'll need to use npm to get
the sawtooth-sdk:

npm install sawtooth-sdk