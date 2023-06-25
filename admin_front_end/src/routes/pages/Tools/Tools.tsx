import {
  DeleteOutlined,
  EditOutlined,
  PlusCircleOutlined
} from '@ant-design/icons'
import {
  Button,
  Card,
  message,
  Popconfirm,
  Space,
  Switch,
  Table,
  Tag
} from 'antd'
import { ColumnProps } from 'antd/lib/table'
import { FilterConfirmProps } from 'antd/lib/table/interface'
import { Key, useState } from 'react'
import { useMutation, useQuery } from 'react-query'
import { Link, useHistory } from 'react-router-dom'
import type { Entity, Tool } from '../../../types'
import { transport } from '../../../util/Api'
import { getColumnSearchTextProps } from '../../../util/Filter'

type DataIndex = keyof Tool

const Tools = () => {
  const history = useHistory()
  const [searchText, setSearchText] = useState('')
  const [searchedColumn, setSearchColumn] = useState('')
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([])
  const {
    data: tools,
    isLoading,
    refetch
  } = useQuery<Tool[]>(
    'tools',
    async () => await transport.get('/tools').then((res) => res.data)
  )
  const { data: entities } = useQuery<Entity[]>(
    'entities',
    async () => await transport.get('/entities').then((res) => res.data)
  )
  const updateToolsMutation = useMutation<
    any,
    unknown,
    { ids: number[]; active: boolean }
  >(
    async (sponsor) =>
      await transport
        .post(`/tools/updateStatusForTools`, sponsor)
        .then((res) => res.data),
    {
      onSuccess: async () => {
        void message.success('Tools updated')
        await refetch()
      },
      onError: async () => {
        await message.error('Error Updating')
      }
    }
  )

  const deleteMutation = useMutation<any, unknown, { ids: Key[] }>(
    async (ids) =>
      await transport.post('/tools/delete-tools', ids).then((res) => res.data),
    {
      onSuccess: async () => {
        await refetch()
        await message.success('Tools(s) Deleted')
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
    if (clearFilters !== undefined) clearFilters()
    setSearchText('')
  }

  const updateStatus = (checked: boolean, record: Tool) => {
    updateToolsMutation.mutate({
      ids: [record.id],
      active: checked
    })
  }

  const columns: Array<ColumnProps<Tool>> = [
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
      })
    },
    {
      title: 'Entity',
      key: 'entity',
      dataIndex: 'entity',
      render: (_, record) => <Tag>{record.entity?.name}</Tag>,
      filters:
        entities != null
          ? entities.map((entity) => ({
              text: entity.name,
              value: entity.id
            }))
          : [],
      onFilter: (value, record) => record.entity.id === value
    },
    {
      title: 'Status',
      key: 'status',
      dataIndex: 'status',
      render: (_, record) => (
        <Space align='baseline'>
          <Switch
            style={{ backgroundColor: '#52c41a' }}
            checked={record.active}
            onChange={(checked) => updateStatus(checked, record)}
          />
        </Space>
      )
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Link to={`/tools/${record.id}/edit`}>
            <Button shape='circle' icon={<EditOutlined />} type='link' />
          </Link>
        </Space>
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
            onClick={() => history.push('/tools/create')}
            type='primary'
          >
            Add
          </Button>,
          <Popconfirm
            key={2}
            disabled={!hasSelected}
            title='Are you sure delete this tool?'
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
        title={<h2>Sponsors</h2>}
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
          dataSource={tools != null ? tools : []}
        />
      </Card>
    </div>
  )
}

export default Tools
