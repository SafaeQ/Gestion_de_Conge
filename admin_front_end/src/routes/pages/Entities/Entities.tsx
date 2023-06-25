import {
  DeleteOutlined,
  PlusCircleOutlined,
  SyncOutlined
} from '@ant-design/icons'
import { Button, Table, Card, message, Popconfirm, Tag } from 'antd'
import { ColumnProps } from 'antd/lib/table'
import { FilterConfirmProps } from 'antd/lib/table/interface'
import { Key, useState } from 'react'
import { useMutation, useQuery } from 'react-query'
import { Link, useHistory } from 'react-router-dom'
import { Entity } from '../../../types'
import { transport } from '../../../util/Api'
import { getColumnSearchTextProps } from '../../../util/Filter'

type DataIndex = keyof Entity

const Entities = () => {
  const history = useHistory()
  const [searchText, setSearchText] = useState('')
  const [searchedColumn, setSearchColumn] = useState('')
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([])
  const {
    data: entities,
    isLoading,
    refetch
  } = useQuery<Entity[]>('entities', async () =>
   await transport.get('/entities').then((res) => res.data)
  )
  const deleteMutation = useMutation<any, unknown, { ids: Key[] }>(
    async (ids) =>
      await transport.post('/entities/delete-entities', ids).then((res) => res.data),
    {
      onSuccess: async () => {
        await refetch()
        await message.success('Entities(s) Deleted')
      },
      onError: async () => {
        await message.error('Error While Deleting Please try again')
      }
    }
  )

  const confirm = (ids: Key[]) => {
    deleteMutation.mutate({ ids })
    setSelectedRowKeys([])
  }

  const cancel = () => {
    setSelectedRowKeys([])
  }

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

  const columns: Array<ColumnProps<Entity>> = [
    {
      title: 'Name',
      key: 'name',
      dataIndex: 'name',
      ...getColumnSearchTextProps('name', {
        handleReset,
        handleSearch,
        setSearchText,
        setSearchColumn,
        searchText,
        searchedColumn
      }),
      render: (_, record) => (
        <Link to={`/entities/${record.id}/edit`}>{record.name}</Link>
      )
    },
    {
      title: 'Chef',
      key: 'chef',
      dataIndex: 'chef',
      render: (_, record) => record.chef?.name
    },
    {
      title: 'Status',
      key: 'status',
      dataIndex: 'status',
      render: (_, record) => (
        <Tag color={record.status === 'active' ? 'green' : 'volcano'}>
          {record.status}
        </Tag>
      )
    }
  ]
  const hasSelected = selectedRowKeys.length > 0

  return (
    <div>
      <Card
        extra={[
          <Button
            key={1}
            icon={<PlusCircleOutlined />}
            onClick={() => history.push('/entities/create')}
            type='primary'
          >
            Add
          </Button>,
          <Button
            key={2}
            icon={<SyncOutlined />}
            onClick={() => history.push('/entities/import')}
            type='primary'
          >
            Sync
          </Button>,
          <Popconfirm
            key={3}
            disabled={!hasSelected}
            title='Are you sure delete this entity?'
            onConfirm={(e) => confirm(selectedRowKeys)}
            onCancel={cancel}
            okText='Yes'
            cancelText='No'
          >
            <Button
              loading={deleteMutation.isLoading}
              danger
              disabled={!hasSelected}
              icon={<DeleteOutlined />}
            >
              Delete
            </Button>
          </Popconfirm>
        ]}
        title={<h2>Entities</h2>}
        bodyStyle={{ padding: 40 }}
      >
        <Table
          loading={isLoading}
          bordered={true}
          rowSelection={{
            onChange: (selectedRowKeys) => {
              setSelectedRowKeys(selectedRowKeys)
            },
            selectedRowKeys
          }}
          rowKey='id'
          columns={columns}
          dataSource={(entities != null) ? entities : []}
        />
      </Card>
    </div>
  )
}

export default Entities
