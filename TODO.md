## UI
    D - Do not rate own messages
- Scroll channel down to the bottom
- Notify user if server is down
- Hide account status if requested or small screen
- Tutorial
- Mattermost, no js text, on facebook looks bad

## SYNC
    D - Global event id to include timestamp
- Reconnect logic
- Disconnect logic (remove event pushers)
- Last sync time logic needs quite a bit of work. It's naive right now, assuming that events always come in order.
- Demurrage
    * food for thought: only nodes that have been on in the past x amount of time can perform demurrage
- TEST: existing events aren't processed again
- When handling update request make sure that you're not sending events that recipient knows about

## System
    D - start people off with 100 community share points
    D - How not to bleed com. pot by high earners
    D - User should be able to rate a message even if it is not in their DB
- Splitting pot should not issue events if there is nothing to split
- Set database id
- Figure out why not all events were relayed by the server (could it be reconnect and disconnect?)

## Tests
    D - Demurrage calc. tests need update
