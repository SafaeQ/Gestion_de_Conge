import { LeftOutlined, SaveOutlined } from '@ant-design/icons'
import { Button, Card, Input, message, Form, Select } from 'antd'
import { useMutation, useQuery } from 'react-query'
import { useHistory } from 'react-router-dom'
import { Entity } from '../../../types'
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

  const createSponsorMutation = useMutation(
    async (data) =>
      await transport
        .post('/sponsors/create', { sponsor: data })
        .then((res) => res.data),
    {
      onSuccess: async () => {
        form.resetFields()
        history.goBack()
        void message.success('sponsor created')
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
        createSponsorMutation.mutate(values)
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
          loading={createSponsorMutation.isLoading}
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
      title='Create Sponsor'
    >
      <Form
        {...formItemLayout}
        initialValues={{
          restricted_pages: []
        }}
        labelAlign='left'
        form={form}
      >
        <Form.Item
          rules={[{ required: true, message: 'Please input the name!' }]}
          name='name'
          label='Name'
        >
          <Input placeholder='Name' />
        </Form.Item>
        <Form.Item
          rules={[{ required: true, message: 'Please input the Login Page!' }]}
          name='login_link'
          label='Login Page'
        >
          <Input placeholder='Login Page' />
        </Form.Item>
        <Form.Item
          rules={[{ required: true, message: 'Please input the Home Page!' }]}
          name='home_link'
          label='Home Page'
        >
          <Input placeholder='Home Page' />
        </Form.Item>
        <Form.Item
          rules={[
            { required: true, message: 'Please input the Login Selector!' }
          ]}
          name='login_selector'
          label='Login Selector'
        >
          <Input placeholder='Login Selector' />
        </Form.Item>
        <Form.Item
          rules={[{ required: true, message: 'Please input the name!' }]}
          name='password_selector'
          label='Password Selector'
        >
          <Input placeholder='Password Selector' />
        </Form.Item>
        <Form.Item
          rules={[
            { required: true, message: 'Please input the Submit Selector!' }
          ]}
          name='submit_selector'
          label='Submit Selector'
        >
          <Input placeholder='Submit Selector' />
        </Form.Item>
        <Form.Item
          rules={[{ required: true, message: 'Please input the Username!' }]}
          name='username'
          label='Username'
        >
          <Input placeholder='Username' />
        </Form.Item>
        <Form.Item
          rules={[{ required: true, message: 'Please input the Password!' }]}
          name='password'
          label='Password'
        >
          <Input placeholder='Password' />
        </Form.Item>
        <Form.Item
          rules={[{ type: 'array', required: true, message: 'Required!' }]}
          name='entities'
          label='Select entities'
        >
          <Select<number[], { value: number; children: string }>
            mode='multiple'
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
        <Form.Item
          rules={[{ type: 'array' }]}
          name='restricted_pages'
          label='Restricted pages'
        >
          <Select
            allowClear
            mode='tags'
            style={{
              width: '100%'
            }}
            tokenSeparators={[',']}
          >
            {[]}
          </Select>
        </Form.Item>
      </Form>
    </Card>
  )
}
