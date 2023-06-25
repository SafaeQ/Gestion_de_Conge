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
  Table,
  Tag,
  Switch
} from 'antd'
import { ColumnProps } from 'antd/lib/table'
import { FilterConfirmProps } from 'antd/lib/table/interface'
import { Key, useState } from 'react'
import { useMutation, useQuery } from 'react-query'
import { Link, useHistory } from 'react-router-dom'
import { Entity, Sponsor } from '../../../types'
import { transport } from '../../../util/Api'
import { getColumnSearchTextProps } from '../../../util/Filter'

type DataIndex = keyof Sponsor

const Sponsors = () => {
  const history = useHistory()
  const [searchText, setSearchText] = useState('')
  const [searchedColumn, setSearchColumn] = useState('')
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([])
  const {
    data: sponsors,
    isFetching,
    refetch
  } = useQuery<Sponsor[]>(
    'sponsors',
    async () => await transport.get('/sponsors').then((res) => res.data)
  )
  const { data: entities } = useQuery<Entity[]>(
    'entities',
    async () => await transport.get('/entities').then((res) => res.data)
  )

  const updateSponsorMutation = useMutation<
    any,
    unknown,
    { ids: number[]; status: string }
  >(
    async (sponsor) =>
      await transport
        .post(`/sponsors/updateStatusForSponsors`, sponsor)
        .then((res) => res.data),
    {
      onSuccess: async () => {
        void message.success('Sponsor updated')
        await refetch()
      },
      onError: async () => {
        await message.error('Error Updating')
      }
    }
  )

  const deleteMutation = useMutation<any, unknown, { ids: Key[] }>(
    async (ids) =>
      await transport
        .post('/sponsors/delete-sponsors', ids)
        .then((res) => res.data),
    {
      onSuccess: async () => {
        await refetch()
        await message.success('Sponsors(s) Deleted')
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

  const updateStatus = (checked: boolean, record: Sponsor) => {
    updateSponsorMutation.mutate({
      ids: [record.id],
      status: checked ? 'active' : 'inactive'
    })
  }

  const columns: Array<ColumnProps<Sponsor>> = [
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
      title: 'Username',
      key: 'username',
      dataIndex: 'username',
      ...getColumnSearchTextProps('username', {
        handleReset,
        handleSearch,
        setSearchText,
        setSearchColumn,
        searchText,
        searchedColumn
      })
    },
    {
      title: 'Password',
      key: 'password',
      dataIndex: 'password',
      responsive: ['xxl']
    },
    {
      title: 'Link',
      key: 'login_link',
      dataIndex: 'login_link',
      ...getColumnSearchTextProps('login_link', {
        handleReset,
        handleSearch,
        setSearchText,
        setSearchColumn,
        searchText,
        searchedColumn
      }),
      responsive: ['xxl']
    },
    {
      title: 'Restricted Pages',
      key: 'restricted_pages',
      dataIndex: 'restricted_pages',
      render: (_, record) =>
        record.restricted_pages?.map((page, i) => <Tag key={i}>{page}</Tag>),
      responsive: ['xxl']
    },
    {
      title: 'Entities',
      key: 'entities',
      dataIndex: 'name',
      render: (_, record) =>
        record.entities.map((rec) => <Tag key={rec.id}>{rec.name}</Tag>),
      filters:
        entities != null
          ? entities.map((entity) => ({
              text: entity.name,
              value: entity.id
            }))
          : [],
      onFilter: (value, record) =>
        record.entities.findIndex((entity) => entity.id === value) !== -1,
      width: '15%'
    },
    {
      title: 'Status',
      key: 'status',
      dataIndex: 'status',
      render: (_, record) => (
        <Space align='baseline'>
          <Switch
            style={{ backgroundColor: '#52c41a', color: 'black' }}
            checkedChildren={record.status}
            unCheckedChildren={record.status}
            checked={record.status === 'active'}
            onChange={(checked) => updateStatus(checked, record)}
          />
        </Space>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space align='baseline'>
          <Link to={`/sponsors/${record.id}/edit`}>
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
            onClick={() => history.push('/sponsors/create')}
            type='primary'
          >
            Add
          </Button>,
          <Popconfirm
            key={2}
            disabled={!hasSelected}
            title='Are you sure delete this sponsor?'
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
          loading={isFetching}
          bordered={true}
          rowSelection={{
            onChange: (selectedRowKeys) => {
              setSelectedRowKeys(selectedRowKeys)
            },
            selectedRowKeys
          }}
          rowKey='id'
          columns={columns}
          dataSource={sponsors != null ? sponsors : []}
        />
      </Card>
    </div>
  )
}

export default Sponsors
