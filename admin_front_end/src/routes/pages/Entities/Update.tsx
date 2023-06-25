import { LeftOutlined, SaveOutlined, SyncOutlined } from '@ant-design/icons'
import { Button, Card, Input, message, Select, Switch, Form } from 'antd'
import { useEffect } from 'react'
import { useMutation, useQuery } from 'react-query'
import { useHistory, useParams } from 'react-router-dom'
import { Departement, User } from '../../../types'
import { transport } from '../../../util/Api'

const formItemLayout = {
  labelCol: {
    span: 6
  },
  wrapperCol: {
    span: 10
  }
}

export default function Update () {
  const [form] = Form.useForm()
  const history = useHistory()
  const { id } = useParams<{ id: string }>()

  const {
    data: users,
    isLoading,
    isFetched
  } = useQuery<User[]>(
    'users',
    async () => await transport.get('/users/chef').then((res) => res.data)
  )

  const {
    data: entity,
    isLoading: isLoadingEntity,
    isFetched: isFetchedEntity
  } = useQuery<Departement>(
    'entity',
    async () => await transport.get(`/entities/${id}`).then((res) => res.data)
  )

  const updateMutation = useMutation(
    async (data) =>
      await transport
        .put(`/entities/${id}`, { entity: data })
        .then((res) => res.data),
    {
      onSuccess: async () => {
        history.goBack()
        void message.success('Entity updated')
        form.resetFields()
      },
      onError: async () => {
        void message.error('Error Updating')
      }
    }
  )

  useEffect(() => {
    if (isFetchedEntity && entity != null) {
      form.setFieldsValue({
        ...entity,
        chef: entity.chef?.id,
        status: entity.status === 'active'
      })
    }
  }, [entity])

  const handleSave = () => {
    form
      .validateFields()
      .then((values) => {
        console.log(values)
        for (const key in values) {
          if (values[key] === undefined) {
            values[key] = null
          }
        }
        updateMutation.mutate({
          ...values,
          status: (values.status as boolean) ? 'active' : 'inactive'
        })
      })
      .catch(() => console.log('error'))
  }
  return (
    <Card
      extra={[
        <Button
          key={1}
          loading={updateMutation.isLoading}
          onClick={() => handleSave()}
          icon={<SaveOutlined />}
          type='primary'
        >
          Save
        </Button>,
        <Button
          key={2}
          onClick={() => history.goBack()}
          icon={<LeftOutlined />}
          type='link'
        >
          goBack
        </Button>
      ]}
      title='Update Entity'
    >
      <Form {...formItemLayout} labelAlign='left' form={form}>
        {isLoadingEntity ? (
          <SyncOutlined spin />
        ) : (
          <>
            <Form.Item
              rules={[{ required: true, message: 'Please input the name!' }]}
              name='name'
              label='Name'
            >
              <Input placeholder='Name' />
            </Form.Item>
            <Form.Item
              rules={[
                { required: true, message: 'Please input the api_link!' }
              ]}
              name='api_link'
              label='Api'
            >
              <Input placeholder='Link' />
            </Form.Item>
            <Form.Item
              rules={[{ type: 'number' }]}
              name='chef'
              label='Select Chef'
            >
              <Select<number, { value: string; children: string }>
                showSearch
                optionFilterProp='children'
                filterOption={(input, option) =>
                  option != null ? option.children.includes(input) : false
                }
                allowClear
                loading={isLoading}
              >
                {isFetched && users != null
                  ? users.map((user) => (
                      <Select.Option value={user.id} key={user.id}>
                        {user.username}
                      </Select.Option>
                    ))
                  : []}
              </Select>
            </Form.Item>
            <Form.Item name='status' label='status' valuePropName='checked'>
              <Switch defaultChecked={true} />
            </Form.Item>
          </>
        )}
      </Form>
    </Card>
  )
}
