import {
  CloudSyncOutlined,
  LeftOutlined,
  SaveOutlined,
  SyncOutlined
} from '@ant-design/icons'
import { Button, Card, Input, message, Form, Select, Switch } from 'antd'
import { useEffect } from 'react'
import { useMutation, useQuery } from 'react-query'
import { useHistory, useParams } from 'react-router-dom'
import AceEditor from 'react-ace'
import 'ace-builds/src-noconflict/mode-sh'
import 'ace-builds/src-noconflict/theme-terminal'
import 'ace-builds/src-noconflict/ext-language_tools'
import { Entity, Tool, TOOLS } from '../../../types'
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
    data: tool,
    isLoading,
    isFetched
  } = useQuery<Tool>(
    'tool',
    async () => await transport.get(`/tools/${id}`).then((res) => res.data)
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
    async (tool) =>
      await transport.put(`/tools/${id}`, { tool }).then((res) => res.data),
    {
      onSuccess: async () => {
        history.goBack()
        await message.success('Tool updated')
        form.resetFields()
      },
      onError: async () => {
        await message.error('Error Updating')
      }
    }
  )

  useEffect(() => {
    if (isFetched && tool != null) {
      form.setFieldsValue({
        ...tool,
        entity: tool.entity?.id
      })
    }
  }, [tool])

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
    <>
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
        title='Update Tool'
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
                rules={[
                  { type: 'string', required: true, message: 'Required!' }
                ]}
                name='tool'
                label='Select tool to install'
              >
                <Select<number[], { value: string; children: string }>
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
                rules={[
                  { required: true, message: 'Please input the password!' }
                ]}
                name='password'
                label='Password'
              >
                <Input placeholder='Password' />
              </Form.Item>
              <Form.Item
                rules={[
                  { required: true, message: 'Please input the Api Link!' }
                ]}
                name='api_link'
                label='Api Link'
              >
                <Input placeholder='Api Link' />
              </Form.Item>
              <Form.Item
                rules={[
                  { required: true, message: 'Please input the Client Url!' }
                ]}
                name='client_url'
                label='Client Url'
              >
                <Input placeholder='Client Url' />
              </Form.Item>
              <Form.Item
                rules={[
                  { type: 'number', required: true, message: 'Required!' }
                ]}
                name='entity'
                label='Select entity'
              >
                <Select<number[], { value: number; children: string }>
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
              <Form.Item name='active' label='status' valuePropName='checked'>
                <Switch style={{ backgroundColor: '#52c41a' }} />
              </Form.Item>
            </>
          )}
        </Form>
      </Card>
      <Card
        title='Installation'
        extra={[
          <Button key={1} icon={<CloudSyncOutlined />} type='primary'>
            install
          </Button>
        ]}
      >
        <AceEditor
          mode='sh'
          setOptions={{
            animatedScroll: true,
            autoScrollEditorIntoView: true
          }}
          showPrintMargin={false}
          theme='terminal'
          value={'logs'}
          name='UNIQUE_ID_OF_DIV'
          style={{ width: '95%' }}
          readOnly={true}
        />
      </Card>
    </>
  )
}
