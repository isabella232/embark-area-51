import * as actions from "../actions";

export default function messages(state = {channels: {}}, action) {
  switch (action.type) {
    case actions.MESSAGE_LISTEN[actions.SUCCESS]: {
      const messages = state.channels[action.channel] ? state.channels[action.channel].messages : [];
      messages.push(action.message.data);
      return {
        ...state,
        channels: {
          ...state.channels,
          [action.channel]: {
            ...state.channels[action.channel],
            messages: messages
          }
        }
      };
    }
    case actions.MESSAGE_LISTEN[actions.REQUEST]: {
      const subscriptions = state.subscriptions || [];
      subscriptions.push(action.channel);
      return {
        ...state,
        subscriptions: subscriptions
      };
    }
    case actions.MESSAGE_VERSION[actions.SUCCESS]: {
      return {
        ...state,
        version: action.version.data
      };
    }
    default:
      return state;
  }
}
