import { Dispatch, SetStateAction } from 'react'
import { Form, Input, message, Modal } from 'antd'
import { TagOutlined } from '@ant-design/icons'
import { useMutation, useQuery } from 'react-query'
import { User } from '../../../types'
import { transport } from '../../../util/Api'
import { RootState } from '../../../appRedux/store'
import { useSelector } from 'react-redux'

const formItemLayout = {
  labelCol: {
    span: 6
  },
  wrapperCol: {
    span: 10
  }
}

const CreateTopic: React.FC<{
  isVisible: boolean
  recepient: User
  setIsVisible: Dispatch<SetStateAction<boolean>>
}> = ({ isVisible, setIsVisible, recepient }) => {
  const [form] = Form.useForm()

  const user = useSelector<RootState, User | undefined>(
    (state) => state.auth.user
  )

  useQuery<User[]>(
    'users',
    async () => await transport.get(`/users/chef`).then((res) => res.data)
  )

  const createTopicMutation = useMutation(
    async (data: { from: number; to: number; subject: string }) =>
      await transport
        .post('/conversations/topics/create', { topic: data })
        .then((res) => res.data),
    {
      onSuccess: async () => {
        await message.success('Topic created')
        setIsVisible(false)
        form.resetFields()
      },
      onError: async () => {
        await message.error('Error Creating')
      }
    }
  )

  const CreateTopicHandler = () => {
    // valide form and send to server
    form
      .validateFields()
      .then((values) => {
        createTopicMutation.mutate({
          ...values,
          to: recepient.id,
          from: user?.id
        })
      })
      .catch((err) => console.log(err))
  }

  return (
    <Modal
      destroyOnClose={true}
      okText='Create'
      onCancel={() => setIsVisible(false)}
      open={isVisible}
      title={`Create new Topic with ${recepient.name}`}
      onOk={CreateTopicHandler}
      centered={true}
      maskClosable={false}
      okButtonProps={{
        icon: <TagOutlined />,
        loading: createTopicMutation.isLoading
      }}
    >
      <Form {...formItemLayout} labelAlign='left' form={form}>
        <Form.Item
          rules={[{ required: true, message: 'Required!' }]}
          name='subject'
          label='Subject'
        >
          <Input placeholder='Subject' />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default CreateTopic
