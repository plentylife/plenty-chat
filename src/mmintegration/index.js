import {createChannel} from '../actions/ChannelActions'
import {setCurrentAgentId, setCurrentCommunityId} from '../state/GlobalState'
import {addAgentToCommunity} from '../actions/AgentActions'
import {nSQL} from 'nano-sql/lib/index'

// eslint-disable-next-line no-unused-vars
export var mmUserSetter = null
export var mmUserGetter = null

export async function onChannelView (agentId: string, channelId: string, communityId: string) {
  setCurrentAgentId(agentId)
  setCurrentCommunityId(communityId)

  console.log('onChannelView')
  console.log('user', mmUserGetter && mmUserGetter())
  // userSetter()

  await nSQL().onConnected(async () => {
    console.log('DB connected (onConnected)')
    await createChannel(agentId, channelId, communityId)
    await addAgentToCommunity(agentId, communityId)
  })
}

export function provideUserGetterSetter (getter: () => Object, setter: (Object) => void) {
  mmUserGetter = getter
  mmUserSetter = setter
}
