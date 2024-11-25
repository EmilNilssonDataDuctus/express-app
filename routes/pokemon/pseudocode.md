

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
caching

