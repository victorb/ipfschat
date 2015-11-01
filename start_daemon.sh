#! /bin/sh

ls /usr/local/bin

/usr/local/bin/ipfs init
/usr/local/bin/ipfs config Addresses.API /ip4/0.0.0.0/tcp/5001
/usr/local/bin/ipfs config Addresses.Gateway /ip4/0.0.0.0/tcp/8080
/usr/local/bin/ipfs daemon
