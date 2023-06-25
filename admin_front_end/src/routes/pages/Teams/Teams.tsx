import { DeleteOutlined, PlusCircleOutlined } from '@ant-design/icons'
import { Button, Table, Card, message, Popconfirm, Tag } from 'antd'
import { ColumnProps } from 'antd/lib/table'
import { FilterConfirmProps } from 'antd/lib/table/interface'
import { Key, useState } from 'react'
import { useMutation, useQuery } from 'react-query'
import { Link, useHistory } from 'react-router-dom'
import { Team } from '../../../types'
import { transport } from '../../../util/Api'
import { getColumnSearchTextProps } from '../../../util/Filter'

type DataIndex = keyof Team

const Teams = () => {
  const history = useHistory()
  const [searchText, setSearchText] = useState('')
  const [searchedColumn, setSearchColumn] = useState('')
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([])
  const {
    data: teams,
    isLoading,
    refetch
  } = useQuery<Team[]>('teams', async () =>
    await transport.get('/teams').then((res) => res.data)
  )
  const deleteMutation = useMutation<any, unknown, { ids: Key[] }>(
    async (ids) => await transport.post('/teams/deleteTeams', ids).then((res) => res.data),
    {
      onSuccess: async () => {
        await refetch()
        await message.success('Teams(s) Deleted')
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

  const columns: Array<ColumnProps<Team>> = [
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
        <Link to={`/teams/${record.id}/edit`}>{record.name}</Link>
      )
    },
    {
      title: 'Departement',
      key: 'departement',
      dataIndex: 'departement',
      render: (_, record) => record.departement?.name
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
            onClick={() => history.push('/teams/create')}
            type='primary'
          >
            Add
          </Button>,
          <Popconfirm
            key={2}
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
        title={<h2>Teams</h2>}
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
          dataSource={(teams != null) ? teams : []}
        />
      </Card>
    </div>
  )
}

export default Teams
