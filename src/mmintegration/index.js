import {createChannel} from '../actions/ChannelActions'
import {setCurrentAgentId, setCurrentCommunityId} from '../state/GlobalState'
import {addAgentToCommunity} from '../actions/AgentActions'
import {nSQL} from 'nano-sql/lib/index'

// eslint-disable-next-line no-unused-vars
export var mmUserSetter = null
export var mmUserGetter = null
export var mmImageGetter = null

export async function onChannelView (agentId: string, channelId: string, communityId: string) {
  setCurrentAgentId(agentId)
  setCurrentCommunityId(communityId)

  console.log('onChannelView')
  console.log('user', mmUserGetter && mmUserGetter(agentId))
  // userSetter()

  await nSQL().onConnected(async () => {
    console.log('DB connected (onConnected)')
    await createChannel(agentId, channelId, communityId)
    const profile = mmUserGetter(agentId)
    await addAgentToCommunity(agentId, communityId, profile.email)
  })
}

export function provideUserGetterSetter (getter: (string) => Object, setter: (Object) => void, imageGetter) {
  mmUserGetter = (id) => {
    const p = getter(id)
    console.log(`for agent ${id} got profile`, p)
    return p
  }
  window.mmug = getter
  mmUserSetter = setter
  mmImageGetter = imageGetter
}
