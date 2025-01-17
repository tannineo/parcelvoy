import { acquireLock, releaseLock } from '../config/scheduler'
import { Job } from '../queue'
import { CampaignJobParams, SentCampaign } from './Campaign'
import CampaignSendJob from './CampaignSendJob'
import { generateSendList, getCampaign } from './CampaignService'

export default class CampaignGenerateListJob extends Job {
    static $name = 'campaign_generate_list_job'

    static from(data: CampaignJobParams): CampaignGenerateListJob {
        return new this(data)
    }

    static async handler({ id, project_id }: CampaignJobParams) {
        const key = `campaign_generate_${id}`
        const acquired = await acquireLock({ key, timeout: 900 })
        if (!acquired) return

        const campaign = await getCampaign(id, project_id) as SentCampaign
        if (campaign.state === 'aborted' || campaign.state === 'draft') return
        await generateSendList(campaign)

        await CampaignSendJob.from({
            id: campaign.id,
            project_id: campaign.project_id,
        }).queue()

        await releaseLock(key)
    }
}
