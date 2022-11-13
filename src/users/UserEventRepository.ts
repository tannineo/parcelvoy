import { UserEvent, UserEventParams } from './UserEvent'

export const createEvent = async (event: UserEventParams): Promise<UserEvent> => {
    return await UserEvent.insertAndFetch(event)
}
