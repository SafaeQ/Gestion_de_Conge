import { LeftOutlined, SaveOutlined, SyncOutlined } from '@ant-design/icons'
import { Button, Card, Input, message, Form, Select } from 'antd'
import { useEffect } from 'react'
import { useMutation, useQuery } from 'react-query'
import { useHistory, useParams } from 'react-router-dom'
import type { Entity, Sponsor } from '../../../types'
import { transport } from '../../../util/Api'

const formItemLayout = {
  labelCol: {
    span: 6
  },
  wrapperCol: {
    span: 10
  }
}

export default function Update() {
  const [form] = Form.useForm()
  const history = useHistory()
  const { id } = useParams<{ id: string }>()
  const {
    data: sponsor,
    isLoading,
    isFetched
  } = useQuery<Sponsor>(
    'sponsor',
    async () => await transport.get(`/sponsors/${id}`).then((res) => res.data)
  )
  const {
    data: entities,
    isLoading: isLoadingEnt,
    isFetched: isFetchedEnt
  } = useQuery<Entity[]>(
    'entities',
    async () => await transport.get('/entities').then((res) => res.data)
  )

  const updateSponsorMutation = useMutation(
    async (sponsor) =>
      await transport
        .put(`/sponsors/${id}`, { sponsor })
        .then((res) => res.data),
    {
      onSuccess: async () => {
        history.goBack()
        void message.success('Sponsor updated')
        form.resetFields()
      },
      onError: async () => {
        void message.error('Error Updating')
      }
    }
  )

  useEffect(() => {
    if (isFetched && sponsor != null) {
      form.setFieldsValue({
        ...sponsor,
        entities: sponsor.entities.map((ent) => ent.id)
      })
    }
  }, [sponsor])

  const handleSave = () => {
    form
      .validateFields()
      .then((values) => {
        for (const key in values) {
          if (values[key] === undefined) {
            values[key] = null
          }
        }
        updateSponsorMutation.mutate(values)
      })
      .catch(async () => await message.error('Error Updating'))
  }
  return (
    <Card
      extra={[
        <Button
          key={1}
          loading={updateSponsorMutation.isLoading}
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
      title='Update Sponsor'
    >
      <Form
        {...formItemLayout}
        initialValues={{
          restricted_pages: []
        }}
        labelAlign='left'
        form={form}
      >
        {isLoading ? (
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
                { required: true, message: 'Please input the Login Page!' }
              ]}
              name='login_link'
              label='Login Page'
            >
              <Input placeholder='Login Page' />
            </Form.Item>
            <Form.Item
              rules={[
                { required: true, message: 'Please input the Home Page!' }
              ]}
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
              rules={[
                { required: true, message: 'Please input the Username!' }
              ]}
              name='username'
              label='Username'
            >
              <Input placeholder='Username' />
            </Form.Item>
            <Form.Item
              rules={[
                { required: true, message: 'Please input the Password!' }
              ]}
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
                    ? option.children
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    : false
                }
                allowClear
                loading={isLoadingEnt}
              >
                {isFetchedEnt && entities != null
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
          </>
        )}
      </Form>
    </Card>
  )
}
