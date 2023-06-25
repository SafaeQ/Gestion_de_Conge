import { CommentOutlined } from '@ant-design/icons'
import { Button, Table, Card, Space, Badge, Popover, Tag } from 'antd'
import { ColumnProps } from 'antd/lib/table'
import { FilterConfirmProps } from 'antd/lib/table/interface'
import { useEffect, useState } from 'react'
import { getColumnSearchTextProps } from '../../../util/Filter'

import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'

import Conversation from './Conversation'
import { Topic, TOPIC_STATUS } from '../../../types'
import { transport } from '../../../util/Api'
import { useQuery } from 'react-query'

dayjs.extend(timezone)
dayjs.extend(utc)
dayjs().tz('Africa/Casablanca')

type DataIndex = keyof Topic
const Topics = () => {
  const [searchText, setSearchText] = useState('')
  const [searchedColumn, setSearchColumn] = useState('')

  const { data, isLoading } = useQuery<Topic[]>(
    'topics',
    async () =>
      await transport.get('/conversations/topics').then((res) => res.data)
  )

  useEffect(() => {}, [])

  const handleSearch = (
    selectedKeys: string[],
    confirm: (param?: FilterConfirmProps) => void,
    dataIndex: DataIndex
  ) => {
    confirm()
    setSearchText(selectedKeys[0])
    setSearchColumn(dataIndex)
  }

  const handleReset = (clearFilters: (() => void) | undefined) => {
    if (clearFilters != null) clearFilters()
    setSearchText('')
  }

  const columns: Array<ColumnProps<Topic>> = [
    {
      title: 'ID',
      key: 'id',
      dataIndex: 'id',
      ...getColumnSearchTextProps('id', {
        handleReset,
        handleSearch,
        setSearchText,
        setSearchColumn,
        searchText,
        searchedColumn
      }),
      render: (_, record) => `#${record.id}`,
      sorter: (a, b) => a.id - b.id
    },
    {
      title: 'From',
      key: 'from',
      dataIndex: 'from',
      render: (_, record) => record.from?.name
    },
    {
      title: 'To',
      key: 'to',
      dataIndex: 'to',
      render: (_, record) => record.to?.name
    },
    {
      title: 'Status',
      key: 'status',
      dataIndex: 'status',
      render: (_, record) =>
        record.status === TOPIC_STATUS.COMPLETED ? (
          <Tag color='#52c41a'>{record.status}</Tag>
        ) : (
          <Tag color='#adc6ff'>{record.status}</Tag>
        )
    },
    {
      title: 'Date',
      key: 'createAt',
      dataIndex: 'createAt',
      render: (_, record) =>
        dayjs(record.createdAt).add(1, 'hour').format('YYYY-MM-DD HH:mm:ss'),
      sorter: (a, b) => dayjs(a.updatedAt).unix() - dayjs(b.updatedAt).unix()
    },
    {
      title: 'Updates',
      key: 'updatedAt',
      dataIndex: 'updatedAt',
      render: (_, record) =>
        dayjs(record.updatedAt).add(1, 'hour').format('YYYY-MM-DD HH:mm:ss'),
      sorter: (a, b) => dayjs(a.updatedAt).unix() - dayjs(b.updatedAt).unix()
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Badge offset={[0, 0]} status='success'>
            <Popover
              destroyTooltipOnHide={true}
              trigger='click'
              placement='left'
              arrowContent={null}
              autoAdjustOverflow
              content={<Conversation topicId={record.id} />}
              title={
                <h2 className='gx-mt-2'>
                  #{record.id} : {record.subject}
                </h2>
              }
            >
              <Button
                shape='circle'
                icon={<CommentOutlined />}
                type='primary'
              />
            </Popover>
          </Badge>
        </Space>
      )
    }
  ]

  return (
    <div>
      <Card title={<h2>Topics</h2>} bodyStyle={{ padding: 40 }}>
        <Table
          loading={isLoading}
          bordered={true}
          rowKey='id'
          columns={columns}
          dataSource={data != null ? data : []}
        />
      </Card>
    </div>
  )
}

export default Topics
