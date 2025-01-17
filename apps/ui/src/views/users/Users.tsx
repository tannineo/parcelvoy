import { useCallback } from 'react'
import { useParams } from 'react-router-dom'
import api from '../../api'
import PageContent from '../../ui/PageContent'
import { SearchTable, useSearchTableQueryState } from '../../ui/SearchTable'
import { useRoute } from '../router'

export default function UserTabs() {
    const { projectId = '' } = useParams()
    const route = useRoute()
    const state = useSearchTableQueryState(useCallback(async params => await api.users.search(projectId, params), [projectId]))

    return <PageContent title="Users">
        <SearchTable
            {...state}
            columns={[
                { key: 'full_name', title: 'Name' },
                { key: 'external_id', title: 'External ID' },
                { key: 'email' },
                { key: 'phone' },
                { key: 'locale' },
                { key: 'created_at', sortable: true },
            ]}
            onSelectRow={({ id }) => route(`users/${id}`)}
            enableSearch
            searchPlaceholder="Search by ID, email or phone"
        />
    </PageContent>
}
