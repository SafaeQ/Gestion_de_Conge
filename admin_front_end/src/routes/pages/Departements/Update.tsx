import { LeftOutlined, SaveOutlined, SyncOutlined } from '@ant-design/icons'
import { Button, Card, Input, message, Select, Switch, Form } from 'antd'
import { useEffect } from 'react'
import { useMutation, useQuery } from 'react-query'
import { useHistory, useParams } from 'react-router-dom'
import { Departement, STATUS, User } from '../../../types'
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
    data: departement,
    isLoading: isLoadingDep,
    isFetched: isFetchedDep
  } = useQuery<Departement>(
    'departement',
    async () =>
      await transport.get(`/departements/${id}`).then((res) => res.data)
  )

  const updateDepartementMutation = useMutation(
    async (data) =>
      await transport
        .put(`/departements/${id}`, { departement: data })
        .then((res) => res.data),
    {
      onSuccess: async () => {
        history.goBack()
        void message.success('Departement updated')
        form.resetFields()
      },
      onError: async () => {
        void message.error('Error Updating')
      }
    }
  )

  useEffect(() => {
    if (isFetchedDep && departement != null) {
      form.setFieldsValue({
        ...departement,
        chef: departement.chef?.id,
        status: departement.status === STATUS.Active
      })
    }
  }, [departement])

  const handleSave = () => {
    form
      .validateFields()
      .then((values) => {
        for (const key in values) {
          if (values[key] === undefined) {
            values[key] = null
          }
        }
        updateDepartementMutation.mutate({
          ...values,
          status: (values.status as boolean) ? 'active' : 'inactive'
        })
      })
      .catch(async () => await message.error('Error Updating'))
  }
  return (
    <Card
      extra={[
        <Button
          key={1}
          loading={updateDepartementMutation.isLoading}
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
      title='Update Departement'
    >
      <Form {...formItemLayout} labelAlign='left' form={form}>
        {isLoadingDep ? (
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
              rules={[{ type: 'number' }]}
              name='chef'
              label='Select Chef'
            >
              <Select<number, { value: number; children: string }>
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
            <Form.Item
              rules={[
                { required: true, message: 'Please choose departement type!' }
              ]}
              name='depart_type'
              label='Departement Type'
            >
              <Select>
                {['PROD', 'SUPPORT'].map((departType) => (
                  <Select.Option key={departType}>{departType}</Select.Option>
                ))}
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
