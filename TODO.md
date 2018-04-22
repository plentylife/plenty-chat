## UI
- Do not rate own messages
- Scroll channel down to the bottom
- Notify user if server is down
- Hide account status if requested or small screen
- Tutorial

## SYNC
- Reconnect logic
- Disconnect logic (remove event pushers)
- Last sync time logic needs quite a bit of work. It's naive right now, assuming that events always come in order.
- Demurrage
    * food for thought: only nodes that have been on in the past x amount of time can perform demurrage
- Global event id to include timestamp
- TEST: existing events aren't processed again
- When handling update request make sure that you're not sending events that recipient knows about

## System
- start people off with 100 community share points

## Tests
- Demurrage calc. tests need update