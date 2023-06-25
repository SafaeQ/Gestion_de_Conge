import { DeleteOutlined, PlusCircleOutlined } from '@ant-design/icons'
import { Button, Card, message, Popconfirm, Table, Tag } from 'antd'
import { ColumnProps } from 'antd/lib/table'
import { FilterConfirmProps } from 'antd/lib/table/interface'
import { Key, useState } from 'react'
import { useMutation, useQuery } from 'react-query'
import { useHistory, Link } from 'react-router-dom'
import { Departement } from '../../../types'
import { transport } from '../../../util/Api'
import { getColumnSearchTextProps } from '../../../util/Filter'

type DataIndex = keyof Departement

const Departements = () => {
  const history = useHistory()
  const [searchText, setSearchText] = useState('')
  const [searchedColumn, setSearchColumn] = useState('')
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([])
  const {
    data: departements,
    isLoading,
    refetch
  } = useQuery<Departement[]>('departements', async () =>
    await transport.get('/departements').then((res) => res.data)
  )
  const deleteMutation = useMutation<any, unknown, { ids: Key[] }>(
    async (ids) =>
      await transport
        .post('/departements/delete-departements', ids)
        .then((res) => res.data),
    {
      onSuccess: async () => {
        await refetch()
        await message.success('Departements(s) Deleted')
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

  const columns: Array<ColumnProps<Departement>> = [
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
        <Link to={`/departements/${record.id}/edit`}>{record.name}</Link>
      )
    },
    {
      title: 'Chef',
      key: 'chef',
      dataIndex: 'chef',
      render: (_, record) => record.chef?.username
    },
    {
      title: 'Type',
      key: 'depart_type',
      dataIndex: 'depart_type'
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
            onClick={() => history.push('/departements/create')}
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
        title={<h2>Departements</h2>}
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
          dataSource={(departements != null) ? departements : []}
        />
      </Card>
    </div>
  )
}

export default Departements
