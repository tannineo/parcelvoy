import { useCallback, useContext, useState } from 'react'
import { useNavigate } from 'react-router'
import api, { apiUrl } from '../../api'
import { Campaign, CampaignDelivery, CampaignState } from '../../types'
import Button, { LinkButton } from '../../ui/Button'
import { ArchiveIcon, DuplicateIcon, EditIcon, PlusIcon } from '../../ui/icons'
import Menu, { MenuItem } from '../../ui/Menu'
import Modal from '../../ui/Modal'
import PageContent from '../../ui/PageContent'
import { SearchTable, useSearchTableQueryState } from '../../ui/SearchTable'
import Tag, { TagVariant } from '../../ui/Tag'
import { snakeToTitle } from '../../utils'
import { CampaignForm } from './CampaignForm'
import { ChannelIcon } from './ChannelTag'
import PreviewImage from '../../ui/PreviewImage'
import { Alert } from '../../ui'
import { ProjectContext } from '../../contexts'

export const CampaignTag = ({ state }: { state: CampaignState }) => {
    const variant: Record<CampaignState, TagVariant> = {
        draft: 'plain',
        aborted: 'error',
        pending: 'info',
        scheduled: 'info',
        running: 'info',
        finished: 'success',
    }

    return <Tag variant={variant[state]}>
        {snakeToTitle(state)}
    </Tag>
}

export const DeliveryRatio = ({ delivery }: { delivery: CampaignDelivery }) => {
    const sent = (delivery?.sent ?? 0).toLocaleString()
    const total = (delivery?.total ?? 0).toLocaleString()
    return `${sent} / ${total}`
}

export default function Campaigns() {
    const [project] = useContext(ProjectContext)
    const navigate = useNavigate()
    const state = useSearchTableQueryState(useCallback(async params => await api.campaigns.search(project.id, params), [project.id]))
    const [isCreateOpen, setIsCreateOpen] = useState(false)

    const handleCreateCampaign = (campaign: Campaign) => {
        setIsCreateOpen(false)
        navigate(`${campaign.id}/design`)
    }

    const handleEditCampaign = (id: number) => {
        navigate(id.toString())
    }

    const handleDuplicateCampaign = async (id: number) => {
        const campaign = await api.campaigns.duplicate(project.id, id)
        navigate(campaign.id.toString())
    }

    const handleArchiveCampaign = async (id: number) => {
        await api.campaigns.delete(project.id, id)
        await state.reload()
    }

    return (
        <>
            <PageContent title="Campaigns" actions={
                <Button icon={<PlusIcon />} onClick={() => setIsCreateOpen(true)}>Create Campaign</Button>
            } banner={project.has_provider === false && (
                <Alert
                    variant="plain"
                    title="Setup"
                    actions={
                        <LinkButton to={`/projects/${project.id}/settings/integrations`}>Setup Integration</LinkButton>
                    }
                >Campaigns depend on message integrations to be able to send. Configure an integration to start sending messages!
                </Alert>
            )}>
                <SearchTable
                    {...state}
                    columns={[
                        {
                            key: 'name',
                            sortable: true,
                            cell: ({ item: { id, name, channel } }) => (
                                <div className="multi-cell">
                                    { channel === 'email'
                                        ? <PreviewImage url={apiUrl(project.id, `campaigns/${id}/preview`)} width={50} height={40}>
                                            <div className="placeholder">
                                                <ChannelIcon channel={channel} />
                                            </div>
                                        </PreviewImage>
                                        : <div className="placeholder">
                                            <ChannelIcon channel={channel} />
                                        </div>
                                    }
                                    <div className="text">
                                        <div className="title">{name}</div>
                                        <div className="subtitle">
                                            {snakeToTitle(channel)}</div>
                                    </div>
                                </div>
                            ),
                        },
                        {
                            key: 'state',
                            sortable: true,
                            cell: ({ item: { state } }) => CampaignTag({ state }),
                        },
                        {
                            key: 'delivery',
                            cell: ({ item: { delivery } }) => DeliveryRatio({ delivery }),
                        },
                        {
                            key: 'send_at',
                            sortable: true,
                            title: 'Launched At',
                        },
                        { key: 'updated_at', sortable: true },
                        {
                            key: 'options',
                            cell: ({ item: { id } }) => (
                                <Menu size="small">
                                    <MenuItem onClick={() => handleEditCampaign(id)}>
                                        <EditIcon />Edit
                                    </MenuItem>
                                    <MenuItem onClick={async () => await handleDuplicateCampaign(id)}>
                                        <DuplicateIcon />Duplicate
                                    </MenuItem>
                                    <MenuItem onClick={async () => await handleArchiveCampaign(id)}>
                                        <ArchiveIcon />Archive
                                    </MenuItem>
                                </Menu>
                            ),
                        },
                    ]}
                    onSelectRow={({ id }) => navigate(id.toString())}
                    enableSearch
                    tagEntity="campaigns"
                />
            </PageContent>
            <Modal
                open={isCreateOpen}
                onClose={setIsCreateOpen}
                title="Create Campaign"
                size="large"
            >
                <CampaignForm onSave={handleCreateCampaign} />
            </Modal>
        </>
    )
}
