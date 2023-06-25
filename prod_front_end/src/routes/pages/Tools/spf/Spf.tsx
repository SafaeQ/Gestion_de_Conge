import { Card, Tabs, Typography } from 'antd'
import { useParams } from 'react-router-dom'
import type { Tool } from '../../../../types'
import { useQuery } from 'react-query'
import Processes from './Processes'
import { transport } from '../../../../util/Api'
import { useState } from 'react'
import LookupDomain from './LookupPages/LookupDomain'
import LookupTXT from './LookupPages/LookupTXT'
import { SyncOutlined } from '@ant-design/icons'

const { TabPane } = Tabs

export default function Spf() {
  const { toolId } = useParams<{ toolId: string }>()
  const [tool, setTool] = useState<Tool>({} as unknown as Tool)

  const [token, setToken] = useState<string>('')
  useQuery<{ authToken: string }>(
    'user',
    async () =>
      await transport.get('/auth/users/prod/me').then((res) => res.data),
    {
      onSuccess: (data) => {
        setToken(data.authToken)
      }
    }
  )

  const { isFetching } = useQuery<Tool>(
    'tool',
    async () => await transport.get(`/tools/${toolId}`).then((res) => res.data),
    {
      onSuccess(tool) {
        setTool(tool)
      }
    }
  )

  return (
    <Card title={<Typography.Title>Spf Scanner</Typography.Title>} style={{ height: '100%', marginBottom: 0 }}>
      <Tabs type='card' className='gx-tabs-half' defaultActiveKey='1'>
        <TabPane tab={<>Processes</>} key='1'>
          {isFetching ? (
            <SyncOutlined spin />
          ) : (
            <Processes token={token} tool={tool} />
          )}
        </TabPane>
        <TabPane tab={<>Domain Lookup</>} key='2'>
          <LookupDomain token={token} tool={tool} />
        </TabPane>
        <TabPane tab={<>TXT lookup</>} key='3'>
          <LookupTXT token={token} tool={tool} />
        </TabPane>
      </Tabs>
    </Card>
  )
}
