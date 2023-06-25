import { LeftOutlined, SaveOutlined } from '@ant-design/icons'
import { Button, Card, Input, message, Form, Select, Switch } from 'antd'
import { useMutation, useQuery } from 'react-query'
import { useHistory } from 'react-router-dom'
import { Entity, TOOLS } from '../../../types'
import { transport } from '../../../util/Api'

const formItemLayout = {
  labelCol: {
    span: 6
  },
  wrapperCol: {
    span: 10
  }
}

export default function Create() {
  const {
    data: entities,
    isLoading,
    isFetched
  } = useQuery<Entity[]>(
    'entities',
    async () => await transport.get('/entities').then((res) => res.data)
  )

  const createToolMutation = useMutation(
    async (data) =>
      await transport
        .post('/tools/create', { tool: data })
        .then((res) => res.data),
    {
      onSuccess: async () => {
        form.resetFields()
        history.goBack()
        void message.success('tool created')
      },
      onError: async () => {
        void message.error('Error Creating')
      }
    }
  )

  const [form] = Form.useForm()
  const history = useHistory()

  const handleSave = () => {
    form
      .validateFields()
      .then((values) => {
        createToolMutation.mutate(values)
      })
      .catch(async () => {
        await message.error('Error Creating')
      })
  }
  return (
    <Card
      extra={[
        <Button
          key={1}
          loading={createToolMutation.isLoading}
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
      title='Create Tool'
    >
      <Form
        {...formItemLayout}
        initialValues={{
          active: false
        }}
        labelAlign='left'
        form={form}
      >
        <Form.Item
          rules={[{ type: 'string', required: true, message: 'Required!' }]}
          name='tool'
          label='Select tool to install'
        >
          <Select<number[], { value: string; children: string }>
            showSearch
            optionFilterProp='children'
            filterOption={(input, option) =>
              option != null
                ? option.children.toLowerCase().includes(input.toLowerCase())
                : false
            }
            allowClear
            loading={isLoading}
          >
            {Object.values(TOOLS).map((tool, id) => (
              <Select.Option value={tool} key={id}>
                {tool}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          rules={[{ required: true, message: 'Please input the name!' }]}
          name='name'
          label='Name'
        >
          <Input placeholder='Name' />
        </Form.Item>
        <Form.Item
          rules={[{ required: true, message: 'Please input Server IP!' }]}
          name='server'
          label='Server IP'
        >
          <Input placeholder='Server IP' />
        </Form.Item>
        <Form.Item
          rules={[{ required: true, message: 'Please input the Port!' }]}
          name='port'
          label='Port'
        >
          <Input placeholder='Port' />
        </Form.Item>
        <Form.Item
          rules={[{ required: true, message: 'Please input the password!' }]}
          name='password'
          label='Password'
        >
          <Input placeholder='Password' />
        </Form.Item>
        <Form.Item
          rules={[{ required: true, message: 'Please input the Api Link!' }]}
          name='api_link'
          label='Api Link'
        >
          <Input placeholder='Api Link' />
        </Form.Item>
        <Form.Item
          rules={[{ required: true, message: 'Please input the Client Url!' }]}
          name='client_url'
          label='Client Url'
        >
          <Input placeholder='Client Url' />
        </Form.Item>
        <Form.Item
          rules={[{ type: 'number', required: true, message: 'Required!' }]}
          name='entity'
          label='Select entity'
        >
          <Select<number[], { value: number; children: string }>
            showSearch
            optionFilterProp='children'
            filterOption={(input, option) =>
              option != null
                ? option.children.toLowerCase().includes(input.toLowerCase())
                : false
            }
            allowClear
            loading={isLoading}
          >
            {isFetched && entities != null
              ? entities.map((ent) => (
                  <Select.Option value={ent.id} key={ent.id}>
                    {ent.name}
                  </Select.Option>
                ))
              : []}
          </Select>
        </Form.Item>
        <Form.Item name='active' label='status' valuePropName='checked'>
          <Switch style={{ backgroundColor: '#52c41a' }} />
        </Form.Item>
      </Form>
    </Card>
  )
}
