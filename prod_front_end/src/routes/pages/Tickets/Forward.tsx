import { ForwardOutlined } from '@ant-design/icons'
import { Form, message, Modal, Select } from 'antd'
import { Dispatch, SetStateAction, useState } from 'react'
import { useMutation, useQuery } from 'react-query'
import { useSelector } from 'react-redux'
import { RootState } from '../../../appRedux/store'
import { socket } from '../../../context/socket.provider'
import { Departement, Team, TICKET_STATUS, User } from '../../../types'
import { transport } from '../../../util/Api'

const formItemLayout = {
  labelCol: {
    span: 6
  },
  wrapperCol: {
    span: 10
  }
}

const Forward: React.FC<{
  isVisible: boolean
  setIsVisible: Dispatch<SetStateAction<boolean>>
  id: number | null
}> = ({ isVisible, setIsVisible, id }) => {
  /* Getting the user from the redux store. */
  const user = useSelector<RootState, User | undefined>(
    (state) => state.auth.user
  )
  const [form] = Form.useForm()
  const [filteredTeam, setTeams] = useState<Team[]>([])

  const { data: teams, isFetching: isFetchingTeams } = useQuery<Team[]>(
    'teams',
    async () => await transport.get('/teams').then((res) => res.data)
  )

  const { data: departements, isFetched: isFetchedDepart } = useQuery<
    Departement[]
  >(
    'departements',
    async () => await transport.get('/departements').then((res) => res.data)
  )

  const updateMutation = useMutation(
    async (data) =>
      await transport
        .put(`/tickets/${id ?? 0}`, { ticket: data })
        .then((res) => res.data),
    {
      onSuccess: async () => {
        await message.success('Ticket Forwarded')
        socket.emit('forwardTicket', id)
        form.resetFields()
      },
      onError: async () => {
        await message.error('Error Updating')
      }
    }
  )

  const ForwardTicketHandler = () => {
    // valide form and send to server
    form
      .validateFields()
      .then((values) => {
        if (user != null)
          updateMutation.mutate({
            ...values,
            assigned_to: null,
            notes: `Forwarded from ${
              user.departements[0].name
            } Department at ${new Date().toLocaleString()}`,
            status: TICKET_STATUS.Open
          })
      })
      .catch((err) => console.log(err))
  }

  return (
    <Modal
      okText={'Forward'}
      onCancel={() => setIsVisible(false)}
      open={isVisible}
      title={`Forward ticket #${id ?? 0}`}
      onOk={ForwardTicketHandler}
      style={{ height: '80%', minWidth: '50%' }}
      maskClosable={false}
      cancelText={'Close'}
      okButtonProps={{
        icon: <ForwardOutlined />,
        loading: updateMutation.isLoading
      }}
    >
      <Form {...formItemLayout} labelAlign='left' form={form}>
        <Form.Item
          rules={[{ type: 'number', required: true, message: 'Required!' }]}
          name='departement'
          label='Select departement'
        >
          <Select<string[], { value: string; children: string }>
            showSearch
            optionFilterProp='children'
            onChange={(value) => {
              if ((teams != null) && Array.isArray(teams)) {
                setTeams(
                  teams.filter((team) => team.departement?.id === Number(value))
                )
              }
            }}
            filterOption={(input, option) =>
              (option != null) ? option.children.includes(input) : false
            }
            allowClear
            loading={isFetchingTeams}
          >
            {isFetchedDepart && (departements != null)
              ? departements
                  .filter((depart) => depart.depart_type === 'SUPPORT')
                  .map((team) => (
                    <Select.Option value={team.id} key={team.id}>
                      {team.name}
                    </Select.Option>
                  ))
              : []}
          </Select>
        </Form.Item>

        <Form.Item
          rules={[{ type: 'number', required: true, message: 'Required!' }]}
          name='target_team'
          label='Select team'
        >
          <Select<string[], { value: string; children: string }>
            showSearch
            optionFilterProp='children'
            filterOption={(input, option) =>
              (option != null) ? option.children.includes(input) : false
            }
            allowClear
            loading={isFetchingTeams}
          >
            {filteredTeam.map((team) => (
              <Select.Option value={team.id} key={team.id}>
                {team.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default Forward
