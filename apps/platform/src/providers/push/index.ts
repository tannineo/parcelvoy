import { loadProvider } from '../ProviderRepository'
import { loadControllers } from '../ProviderService'
import LocalPushProvider from './LocalPushProvider'
import LoggerPushProvider from './LoggerPushProvider'
import PushChannel from './PushChannel'
import { PushProvider, PushProviderName } from './PushProvider'

const typeMap = {
    local: LocalPushProvider,
    logger: LoggerPushProvider,
}

export const providerMap = (record: { type: PushProviderName }): PushProvider => {
    return typeMap[record.type].fromJson(record)
}

export const loadPushChannel = async (providerId: number, projectId: number): Promise<PushChannel | undefined> => {
    const provider = await loadProvider(providerId, providerMap, projectId)
    if (!provider) return
    return new PushChannel(provider)
}

export const loadPushControllers = loadControllers(typeMap, 'push')
