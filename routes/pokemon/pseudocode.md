

# detailed response
call my detailed endpoint

if not cached
call 3rd party endpoint
cache detailed data from 3rd party endpoint


# lw response
call my lw endpoint

if not cached
call my detailed endpoint

if not cached
call 3rd party endpoint
cache detailed data from 3rd party endpoint
cache lw data from detailed cache



# what logic can be shared between calls?

## on detailed request
no layer 1 cache
- get from 3rd party

with layer 1 cache
- get from layer 1


## on lw request
no layer 2 cache
- get from layer 1
no layer 1 cache
- get from 3rd party
- store in layer 1
- store in layer 2

with layer 2 cache
- get from layer 2