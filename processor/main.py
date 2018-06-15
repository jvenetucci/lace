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

import argparse
import logging
import os
import sys
import pkg_resources
import handler

from colorlog import ColoredFormatter

from sawtooth_sdk.processor.core import TransactionProcessor


DISTRIBUTION_NAME = 'lace'

def create_console_handler(verbose_level):
    clog = logging.StreamHandler()
    formatter = ColoredFormatter(
        "%(log_color)s[%(asctime)s %(levelname)-8s%(module)s]%(reset)s "
        "%(white)s%(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
        reset=True,
        log_colors={
            'DEBUG': 'cyan',
            'INFO': 'green',
            'WARNING': 'yellow',
            'ERROR': 'red',
            'CRITICAL': 'red',
        })

    clog.setFormatter(formatter)

    if verbose_level == 0:
        clog.setLevel(logging.WARN)
    elif verbose_level == 1:
        clog.setLevel(logging.INFO)
    else:
        clog.setLevel(logging.DEBUG)

    return clog


def setup_loggers(verbose_level):
    logger = logging.getLogger()
    logger.setLevel(logging.DEBUG)
    logger.addHandler(create_console_handler(verbose_level))

def create_parser(prog_name):
    parser = argparse.ArgumentParser(
        prog=prog_name,
        formatter_class=argparse.RawDescriptionHelpFormatter)

    parser.add_argument('endpoint',
                        nargs='?',
                        default='tcp://localhost:4004',
                        help='Endpoint for the validator connection')

    parser.add_argument(
        '-v', '--verbose',
        action='count',
        default=0,
        help='Increase output sent to stderr')

    try:
        version = pkg_resources.get_distribution(DISTRIBUTION_NAME).version
    except pkg_resources.DistributionNotFound:
        version = 'UNKNOWN'

    parser.add_argument(
        '-V', '--version',
        action='version',
        version=(DISTRIBUTION_NAME + ' (Hyperledger Sawtooth) version {}')
        .format(version),
        help='print version information')

    return parser


def main(prog_name=os.path.basename(sys.argv[0]), args=None,
         with_loggers=True):
    if args is None:
        args = sys.argv[1:]
    parser = create_parser(prog_name)
    args = parser.parse_args(args)

    if with_loggers is True:
        if args.verbose is None:
            verbose_level = 0
        else:
            verbose_level = args.verbose
        setup_loggers(verbose_level=verbose_level)

    # Create a new processor thats connect to the validator
    processor = TransactionProcessor(url=args.endpoint)

    # Create handler(s) and associate it with the processor
    # See handlers.py to add more transaction handlers
    handler.add_handlers(processor)

    # Start the processor
    # Provide an easy way to stop the processor with CTRL-C
    try:
        print("henlo")
        processor.start()
        print("welp")
    except Exception as e:
        print(e)
        print("Error. Stopping processor....")
        processor.stop()
