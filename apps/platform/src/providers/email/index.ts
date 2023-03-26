import { loadProvider } from '../ProviderRepository'
import { loadControllers } from '../ProviderService'
import EmailChannel from './EmailChannel'
import EmailProvider, { EmailProviderName } from './EmailProvider'
import LoggerEmailProvider from './LoggerEmailProvider'
import SESEmailProvider from './SESEmailProvider'
import SMTPEmailProvider from './SMPTEmailProvider'

const typeMap = {
    ses: SESEmailProvider,
    smtp: SMTPEmailProvider,
    logger: LoggerEmailProvider,
}

export const providerMap = (record: { type: EmailProviderName }): EmailProvider => {
    return typeMap[record.type].fromJson(record)
}

export const loadEmailChannel = async (providerId: number, projectId: number): Promise<EmailChannel | undefined> => {
    const provider = await loadProvider(providerId, providerMap, projectId)
    if (!provider) return
    return new EmailChannel(provider)
}

export const loadEmailControllers = loadControllers(typeMap, 'email')