import {
  DeleteOutlined,
  PlusCircleOutlined,
  UnlockOutlined
} from '@ant-design/icons'
import {
  Button,
  Table,
  Card,
  message,
  Popconfirm,
  Tag,
  Space,
  Badge
} from 'antd'
import { ColumnProps } from 'antd/lib/table'
import { FilterConfirmProps } from 'antd/lib/table/interface'
import { Key, useState } from 'react'
import { useMutation, useQuery } from 'react-query'
import { Link, useHistory } from 'react-router-dom'
import { Departement, User } from '../../../types'
import { transport } from '../../../util/Api'
import {
  getColumnSearchOneDepthObjectProps,
  getColumnSearchTextProps
} from '../../../util/Filter'
import CreateRestriction from './AddRestriction'

type DataIndex = keyof User

const Users = () => {
  const {
    data: users,
    isLoading,
    refetch
  } = useQuery<User[]>(
    'users',
    async () => await transport.get('/users').then((res) => res.data)
  )

  const history = useHistory()
  const [isVisible, setIsAddRestrictionVisible] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [userId, setUserID] = useState(0)
  const [searchedColumn, setSearchColumn] = useState('')
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([])

  const deleteMutation = useMutation<any, unknown, { ids: Key[] }>(
    async (ids) =>
      await transport.post('/users/deleteUsers', ids).then((res) => res.data),
    {
      onSuccess: async () => {
        await refetch()
        await message.success('Users(s) Deleted')
      },
      onError: async () => {
        await message.error('Error While Deleting Please try again')
      }
    }
  )

  const { data: departements } = useQuery<Departement[]>(
    'departements',
    async () => await transport.get('/departements').then((res) => res.data)
  )

  const deleteRestrictionMutation = useMutation<any, unknown, number>(
    async (id) =>
      await transport
        .delete(`/users/delete-restriction/${id}`)
        .then((res) => res.data),
    {
      onSuccess: async () => {
        await refetch()
        await message.success('Restriction Deleted')
      },
      onError: async () => {
        await message.error('Error while deleting please try again')
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

  const columns: Array<ColumnProps<User>> = [
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
        <Link to={`/users/${record.id}/edit`}>{record.name}</Link>
      )
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
      title: 'Departments',
      key: 'departement',
      render: (_, record) =>
        record.departements?.map((departement) => (
          <Tag key={departement.id}>{departement.name}</Tag>
        )),
      filters:
        departements != null
          ? departements.map((departement) => ({
              text: departement.name,
              value: departement.id
            }))
          : [],
      onFilter: (value, record) =>
        record.departements.findIndex((depart) => depart.id === value) !== -1
    },
    {
      title: 'Entity',
      key: 'entity',
      dataIndex: 'entity',
      ...getColumnSearchOneDepthObjectProps('entity', 'name', {
        handleReset,
        handleSearch,
        setSearchText,
        setSearchColumn,
        searchText,
        searchedColumn
      }),
      render: (_, record) => record.entity?.name
    },
    {
      title: 'Team',
      key: 'team',
      dataIndex: 'team',
      ...getColumnSearchOneDepthObjectProps('team', 'name', {
        handleReset,
        handleSearch,
        setSearchText,
        setSearchColumn,
        searchText,
        searchedColumn
      }),
      render: (_, record) => record.team?.name
    },
    {
      title: 'Role',
      key: 'role',
      dataIndex: 'role',
      filters: [
        { text: 'ADMINISTRATION', value: 'ADMINISTRATION' },
        {
          text: 'CHEF',
          value: 'CHEF'
        },
        {
          text: 'TEAMLEADER',
          value: 'TEAMLEADER'
        },
        {
          text: 'TEAMMEMBER',
          value: 'TEAMMEMBER'
        }
      ],
      onFilter: (value, record) => record.role.indexOf(value as string) === 0,
      render: (_, record) => record.role
    },
    {
      title: 'Type',
      key: 'user_type',
      dataIndex: 'user_type',
      filters: [
        {
          text: 'PROD',
          value: 'PROD'
        },
        {
          text: 'SUPPORT',
          value: 'SUPPORT'
        },
        {
          text: 'ADMIN',
          value: 'ADMIN'
        }
      ],
      onFilter: (value, record) =>
        record.user_type.indexOf(value as string) === 0
    },
    {
      title: 'Restrictions',
      key: 'restrictions',
      dataIndex: 'restrictions',
      render: (_, record) =>
        record.restrictions?.map((rest) => (
          <Tag
            closable
            onClose={(e) => {
              e.preventDefault()
              deleteRestrictionMutation.mutate(rest.id)
            }}
            key={rest.id}
          >
            {rest.departement?.name}
          </Tag>
        ))
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
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Badge count={record.restrictions?.length}>
            <Button
              onClick={() => {
                setUserID(record.id)
                setIsAddRestrictionVisible(true)
              }}
              icon={<UnlockOutlined />}
              type='primary'
            >
              Restrictions
            </Button>
          </Badge>
        </Space>
      )
    }
  ]
  const hasSelected = selectedRowKeys.length > 0

  return (
    <div>
      {isVisible && (
        <CreateRestriction
          userId={userId}
          refetch={refetch}
          isVisible={isVisible}
          setIsVisible={setIsAddRestrictionVisible}
        />
      )}
      <Card
        extra={[
          <Button
            key={1}
            icon={<PlusCircleOutlined />}
            onClick={() => history.push('/users/create')}
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
        title={<h2>Users</h2>}
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
          dataSource={users != null ? users : []}
        />
      </Card>
    </div>
  )
}

export default Users
