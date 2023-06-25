import { LeftOutlined, SaveOutlined, SyncOutlined } from '@ant-design/icons'
import { Button, Card, Input, message, Select, Switch, Form } from 'antd'
import { useEffect } from 'react'
import { useMutation, useQuery } from 'react-query'
import { useHistory, useParams } from 'react-router-dom'
import { Departement, Team } from '../../../types'
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
    data: departements,
    isLoading: isLoadingDep,
    isFetched: isFetchedDep
  } = useQuery<Departement[]>(
    'departements',
    async () => await transport.get('/departements').then((res) => res.data)
  )

  const {
    data: team,
    isLoading: isLoadingTeam,
    isFetched: isFetchedTeam
  } = useQuery<Team>(
    'team',
    async () => await transport.get(`/teams/${id}`).then((res) => res.data)
  )

  const updateMutation = useMutation(
    async (data) =>
      await transport
        .put(`/teams/${id}`, { team: data })
        .then((res) => res.data),
    {
      onSuccess: async () => {
        history.goBack()
        await message.success('Team updated')
        form.resetFields()
      },
      onError: async () => {
        await message.error('Error Updating')
      }
    }
  )

  useEffect(() => {
    if (isFetchedTeam && (team != null)) {
      form.setFieldsValue({
        ...team,
        departement: team.departement?.id,
        status: team.status === 'active'
      })
    }
  }, [team])

  const handleSave = () => {
    form
      .validateFields()
      .then((values) => {
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
      .catch((err) => console.log(err))
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
      title='Update Team'
    >
      <Form {...formItemLayout} labelAlign='left' form={form}>
        {isLoadingTeam ? (
          <SyncOutlined spin />
        ) : (
          <>
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
                  (option != null) ? option.children.includes(input) : false
                }
                allowClear
                loading={isLoadingDep}
              >
                {isFetchedDep && (departements != null)
                  ? departements.map((departement) => (
                      <Select.Option
                        value={departement.id}
                        key={departement.id}
                      >
                        {departement.name}
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
