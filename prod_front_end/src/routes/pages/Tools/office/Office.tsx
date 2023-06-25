import { useState } from 'react'
import { Card, Col, Row, Table, Tag } from 'antd'
import { ColumnProps } from 'antd/lib/table'
import axios from 'axios'
import dayjs from 'dayjs'
import { useQuery } from 'react-query'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { RootState } from '../../../../appRedux/store'
import { Process, Tool, User } from '../../../../types'
import { transport } from '../../../../util/Api'
import { SyncOutlined } from '@ant-design/icons'

export default function Office() {
  const user = useSelector<RootState, User | undefined>(
    (state) => state.auth.user
  )
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
  const { data } = useQuery(
    'processes',
    async () =>
      await axios
        .get(`${tool.api_link}/processes/${user?.id ?? 0}`, {
          headers: {
            Authorization: 'Bearer ' + token
          }
        })
        .then((res) => res.data),
    {
      refetchIntervalInBackground: true,
      refetchInterval: 2500
    }
  )

  const renderStatus = (status: string) => {
    switch (status) {
      case 'IN_PROCESS':
        return <SyncOutlined style={{ fontSize: '20px' }} spin={true} />
      case 'FINISHED':
        return (
          <Tag color='green' style={{ fontSize: '15px' }}>
            {status}
          </Tag>
        )
      case 'STOPPED':
        return (
          <Tag color='error' style={{ fontSize: '15px' }}>
            {status}
          </Tag>
        )
      case 'Preparing':
        return (
          <Tag color='geekblue' style={{ fontSize: '15px' }}>
            {status}
          </Tag>
        )

      default:
        return (
          <Tag color='magenta' style={{ fontSize: '15px' }}>
            {status}
          </Tag>
        )
    }
  }

  const columns: Array<ColumnProps<Process>> = [
    {
      title: 'ID',
      dataIndex: 'uuid',
      key: 'uuid'
    },
    {
      title: 'File',
      dataIndex: 'filename',
      key: 'filename'
    },
    {
      title: 'Scan Count',
      dataIndex: '',
      key: 'stats',
      render: (_, record) => {
        return (
          <div>
            {record.scanCount}/{record.totalCount}
          </div>
        )
      }
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => renderStatus(status)
    },
    {
      title: 'CreatedAt',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (createdAt) => dayjs(createdAt).format('DD-MM-YYYY hh:mm:ss')
    },
  ]

  return (
    <div>
      {isFetching ? (
        <SyncOutlined spin />
      ) : (
        <Row>
          <Col flex={15} sm={24}>
            <Card title='Accounts'>
              <Table
                pagination={{
                  size: 'default'
                }}
                bordered={true}
                dataSource={data}
                columns={columns}
                size='middle'
                rowKey='_id'
              />
            </Card>
          </Col>
        </Row>
      )}
    </div>
  )
}
