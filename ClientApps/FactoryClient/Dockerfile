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


FROM node:8.11.2

COPY . /usr/src/FactoryClient
WORKDIR /usr/src/FactoryClient

EXPOSE 3000

# Update npm
# RUN npm install npm@latest -g
RUN npm install --silent

CMD ["npm", "start"]