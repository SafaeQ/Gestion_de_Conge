import { Key, useState, FC } from 'react'
import {
  Button,
  Table,
  Space,
  Popconfirm,
  message,
  Card,
  Col,
  Row,
  Popover,
  Tag,
  Statistic
} from 'antd'
import {
  DeleteOutlined,
  EyeTwoTone,
  StopTwoTone,
  PlayCircleTwoTone,
  SyncOutlined
} from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import Upload from './Create'
import axios from 'axios'
import { ColumnProps } from 'antd/lib/table'
import { Process, Tool, User } from '../../../../../types'
import { useSelector } from 'react-redux'
import { RootState } from '../../../../../appRedux/store'
import dayjs from 'dayjs'

const Processes: FC<{ tool: Tool; token: string }> = ({ tool, token }) => {
  const queryClient = useQueryClient()
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([])
  const user = useSelector<RootState, User | undefined>(
    (state) => state.auth.user
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

  const startProcessMutation = useMutation<any, unknown, string>(
    async (id) =>
      await axios
        .post(
          `${tool.api_link}/processes/start/${id}`,
          {},
          {
            headers: {
              Authorization: 'Bearer ' + token
            }
          }
        )
        .then((res) => res.data),
    {
      onSuccess: () => {
        void queryClient.refetchQueries('processes')
        void message.success('Process(s) Started')
      },
      onError: () => {
        void message.error('Error While Deleting Please try again')
      }
    }
  )

  const stopProcessMutation = useMutation<any, unknown, string>(
    async (id) =>
      await axios
        .post(
          `${tool.api_link}/processes/stop/${id}`,
          {},
          {
            headers: {
              Authorization: 'Bearer ' + token
            }
          }
        )
        .then((res) => res.data),
    {
      onSuccess: () => {
        void queryClient.refetchQueries('processes')
        void message.success('Process(s) Stoped')
      },
      onError: () => {
        void message.error('Error While Deleting Please try again')
      }
    }
  )

  // delete Rdp mutation check react-query docs
  const deleteProcessMutation = useMutation<any, unknown, { ids: Key[] }>(
    async (ids) =>
      await axios
        .post(`${tool.api_link}/processes/delete`, ids, {
          headers: {
            Authorization: 'Bearer ' + token
          }
        })
        .then((res) => res.data),
    {
      onSuccess: () => {
        void queryClient.refetchQueries('processes')
        void message.success('Process(s) Deleted')
      },
      onError: () => {
        void message.error('Error While Deleting Please try again')
      }
    }
  )

  const run = (id: string) => {
    void startProcessMutation.mutateAsync(id)
  }
  const stop = (id: string) => {
    void stopProcessMutation.mutateAsync(id)
  }

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
      key: 'uuid',
      render: (uuid) => (
        <Popover content={<Tag color='cyan'>{uuid}</Tag>} title='ID'>
          <Button shape='circle' icon={<EyeTwoTone />} />
        </Popover>
      )
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
      title: 'Scan Ratio',
      dataIndex: '',
      key: 'stats',
      render: (record) => {
        return (
          <Popover
            content={
              <Statistic
                value={(record.scanCount / record.totalCount) * 100}
                precision={2}
                suffix='%'
              />
            }
            title='Scan Ratio'
          >
            <Button shape='circle' icon={<EyeTwoTone />} />
          </Popover>
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
    {
      title: 'UpdatedAt',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (updatedAt) => dayjs(updatedAt).format('DD-MM-YYYY hh:mm:ss')
    },
    {
      title: 'Action',
      key: 'action',
      render: (text, record) => (
        <Space size='middle'>
          <Popconfirm
            disabled={record.status === 'Preparing'}
            title='Are you sure?'
            onConfirm={() => run(record.uuid)}
            onCancel={cancel}
            okText='Yes'
            cancelText='cancel'
          >
            <Button
              disabled={record.status === 'Preparing'}
              title='Start'
              icon={<PlayCircleTwoTone />}
              shape='circle'
            />
          </Popconfirm>
          <Popconfirm
            title='Are you sure?'
            onConfirm={() => stop(record.uuid)}
            onCancel={cancel}
            okText='Yes'
            cancelText='cancel'
          >
            <Button
              title='Stop'
              icon={<StopTwoTone twoToneColor='#cf1322' />}
              shape='circle'
            />
          </Popconfirm>
          <Popconfirm
            title='Are you sure delete this process?'
            onConfirm={() => confirm([record._id])}
            onCancel={cancel}
            okText='Yes'
            cancelText='No'
          >
            <Button
              danger
              title='Delete'
              icon={<DeleteOutlined />}
              shape='circle'
            />
          </Popconfirm>
        </Space>
      )
    }
  ]

  const hasSelected = selectedRowKeys.length > 0

  const confirm = (ids: Key[]) => {
    void deleteProcessMutation.mutateAsync({ ids })
    setSelectedRowKeys([])
  }

  const cancel = () => {
    setSelectedRowKeys([])
  }

  return (
    <div>
      <Row>
        <Col flex={15} sm={24}>
          <Card
            title='Processes'
            extra={[
              <Popconfirm
                key={1}
                disabled={!hasSelected}
                title='Are you sure delete this process?'
                onConfirm={(e) => confirm(selectedRowKeys)}
                onCancel={cancel}
                okText='Yes'
                cancelText='No'
              >
                <Button
                  danger
                  disabled={!hasSelected}
                  icon={<DeleteOutlined />}
                >
                  Delete
                </Button>
              </Popconfirm>
            ]}
          >
            <Table
              rowSelection={{
                type: 'checkbox',
                onChange: (selectedRowKeys) => {
                  setSelectedRowKeys(selectedRowKeys)
                },
                selectedRowKeys
              }}
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
        <Col flex={2} sm={24}>
          <Upload token={token} tool={tool} />
        </Col>
      </Row>
    </div>
  )
}

export default Processes
