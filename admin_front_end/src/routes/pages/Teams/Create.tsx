import { LeftOutlined, SaveOutlined } from '@ant-design/icons'
import { Button, Card, Input, message, Select, Switch, Form } from 'antd'
import { useMutation, useQuery } from 'react-query'
import { useHistory } from 'react-router-dom'
import { Departement } from '../../../types'
import { transport } from '../../../util/Api'

const formItemLayout = {
  labelCol: {
    span: 6
  },
  wrapperCol: {
    span: 10
  }
}

export default function Create () {
  const {
    data: departements,
    isLoading: isFetchingDep,
    isFetched: isFetchedDep
  } = useQuery<Departement[]>('departements', async () =>
    await transport.get('/departements').then((res) => res.data)
  )
  const createMutation = useMutation(
    async (data) =>
      await transport
        .post('/teams/create', { team: data })
        .then((res) => res.data),
    {
      onSuccess: async () => {
        form.resetFields()
        history.goBack()
        void message.success('Team created')
      },
      onError: async (_err) => {
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
        createMutation.mutate(values)
      })
      .catch((err) => console.log(err))
  }
  return (
    <Card
      extra={[
        <Button
          key={1}
          loading={createMutation.isLoading}
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
      title='Create Team'
    >
      <Form {...formItemLayout} labelAlign='left' form={form}>
        <Form.Item
          rules={[{ required: true, message: 'Required!' }]}
          name='name'
          label='Name'
        >
          <Input placeholder='Name' />
        </Form.Item>
        <Form.Item
          rules={[{ type: 'number', required: true, message: 'Required!' }]}
          name='departement'
          label='Select departement'
        >
          <Select<number, { value: number; children: string }>
            showSearch
            optionFilterProp='children'
            filterOption={(input, option) =>
              option != null
                ? option.children.toLowerCase().includes(input.toLowerCase())
                : false
            }
            allowClear
            loading={isFetchingDep}
          >
            {isFetchedDep && departements != null
              ? departements.map((departement) => (
                  <Select.Option value={departement.id} key={departement.id}>
                    {departement.name}
                  </Select.Option>
                ))
              : []}
          </Select>
        </Form.Item>
        <Form.Item name='status' label='status' valuePropName='checked'>
          <Switch defaultChecked={true} />
        </Form.Item>
      </Form>
    </Card>
  )
}
