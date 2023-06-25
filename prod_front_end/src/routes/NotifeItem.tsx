import { CommentOutlined, TagsOutlined } from '@ant-design/icons'
import { Badge, Button } from 'antd'
import React, { useState } from 'react'
import { useQuery } from 'react-query'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../appRedux/store'
import { IqueryParams, ROLE, Ticket, USER_STATUS, User } from '../types'
import { transport } from '../util/Api'
import { useHistory } from 'react-router-dom'
import { socket } from '../context/socket.provider'
import CheckableTag from 'antd/es/tag/CheckableTag'
import { setCurrentUser } from '../appRedux/actions/auth'

export const ChatItem = () => {
  const user = useSelector<RootState, User | undefined>(
    (state) => state.auth.user
  )
  const enabled = user?.role === ROLE.TEAMLEADER || user?.role === ROLE.CHEF

  const { data } = useQuery<number>(
    'checkmsg',
    async () =>
      await transport
        .get(`/conversations/unread/${user?.id ?? 0}`)
        .then((res) => res.data),
    {
      refetchInterval: 2000,
      refetchIntervalInBackground: true,
      notifyOnChangeProps: ['data'],
      enabled
    }
  )
  const history = useHistory()

  return (
    <Badge key={'chat'} count={data} size='small'>
      <Button shape='circle' onClick={() => history.push('chats')}>
        <CommentOutlined />
      </Button>
    </Badge>
  )
}

export const TicketItem = () => {
  const user = useSelector<RootState, User | undefined>(
    (state) => state.auth.user
  )
  let filter: IqueryParams['filter'] = {}
  if (user != null && user.role === 'TEAMMEMBER') {
    filter = {
      user: {
        id: user.id
      }
    }
  } else if (user != null && user.role === 'TEAMLEADER') {
    filter = {
      issuer_team: {
        id: user.team.id
      },
      entity: {
        id: user.entity.id
      }
    }
  } else if (user != null && user.role === 'CHEF') {
    filter = {
      entity: {
        id: user.entity.id
      }
    }
  }

  const [queryParams, setQueryParams] = useState<IqueryParams>({
    access_entity: user?.access_entity ?? [],
    access_team: user?.access_team ?? [],
    filter,
    pageNumber: 1,
    pageSize: 10,
    read: user?.id ?? 0,
    typeUser: user?.user_type,
    sortField: 'updatedAt',
    sortOrder: 'desc'
  })

  const { data } = useQuery<number, Ticket>(
    ['ticketss', setQueryParams],
    async () =>
      await transport
        .post('/tickets/open', { queryParams })
        .then((res) => res.data),
    {
      enabled: !(queryParams == null),
      refetchInterval: 10000,
      refetchIntervalInBackground: true,
      notifyOnChangeProps: ['data']
    }
  )
  const history = useHistory()

  return (
    <Badge key={'tags'} count={data} size='small'>
      <Button shape='circle' onClick={() => history.push('tickets')}>
        <TagsOutlined />
      </Button>
    </Badge>
  )
}

export const AwayButton = () => {
  const [online, setOnline] = useState(true)
  const [user, setUser] = useState<User | undefined>(undefined)
  const dispatch = useDispatch()
  useQuery<{ user: User }>(
    'user',
    async () =>
      await transport.get('/auth/users/prod/me').then((res) => res.data),
    {
      onSuccess: (data) => {
        setUser(data.user)
        dispatch(setCurrentUser(data.user))
      },
      refetchInterval: 3000
    }
  )

  return (
    <>
      <CheckableTag
        checked={online}
        style={{
          backgroundColor:
            user?.activity === USER_STATUS.ONLINE
              ? 'green'
              : user?.activity === USER_STATUS.AWAY
              ? 'orange'
              : 'red'
        }}
        onChange={(checked) => {
          setOnline(checked)
          if (checked) {
            console.log('checked')

            socket.emit('user-online', {
              userId: user?.id,
              activity: USER_STATUS.ONLINE,
              type: 'click'
            })
          } else {
            socket.emit('user-online', {
              userId: user?.id,
              activity: USER_STATUS.AWAY,
              type: 'click'
            })
          }
        }}
      >
        {user?.activity}
      </CheckableTag>
    </>
  )
}
