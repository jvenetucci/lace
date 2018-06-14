#!/bin/bash
curl --request POST --header "Content-Type: application/octet-stream" --data-binary @lace.batches "http://localhost:8008/batches"