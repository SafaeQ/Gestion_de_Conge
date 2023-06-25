import { Card, Collapse, Empty, Typography } from 'antd'
import { useQuery } from 'react-query'
import { useSelector } from 'react-redux'
import { Link, Route, Switch, useRouteMatch } from 'react-router-dom'
import { RootState } from '../../../appRedux/store'
import { Tool, TOOLS, User } from '../../../types'
import { transport } from '../../../util/Api'
import Office from './office/Office'
import Spf from './spf/Spf'

const routes = [
  {
    component: () => <Empty description="Please select a tool from the list above" />,
    path: '',
    exact: true,
    scope: 'member'
  },
  {
    component: Spf,
    path: TOOLS.SPF + '/:toolId',
    exact: true,
    scope: 'member'
  },
  {
    component: Office,
    path: TOOLS.OFFICE + '/:toolId',
    exact: true,
    scope: 'member'
  }
]

const gridStyle: React.CSSProperties = {
  width: '25%',
  height: '100%',
  textAlign: 'center'
}

export default function Tools() {
  const match = useRouteMatch()
  const user = useSelector<RootState, User | undefined>(
    (state) => state.auth.user
  )
  const entity = user?.entity?.id
  const { data: tools } = useQuery<Tool[]>(
    'tools',
    async () =>
      await transport
        .get(`/tools/entity/${entity ?? 0}`)
        .then((res) => res.data)
  )
  return (
    <>
      <Collapse defaultActiveKey={'1'} className='gx-mb-2'>
        <Collapse.Panel header='Tools' key='1'>
          <Card>
            {tools !== undefined
              ? tools.map((tool) => {
                  return (
                    <Card.Grid key={tool.id} style={gridStyle}>
                      <Link to={`${match.path}/${tool.tool}/${tool.id}`}>
                        <Typography.Title level={4}>
                          {tool.name.toUpperCase()}
                        </Typography.Title>
                      </Link>
                    </Card.Grid>
                  )
                })
              : "You don't have any tools registred at the moment!"}
          </Card>
        </Collapse.Panel>
      </Collapse>
      <Switch>
        {routes.map((route, i) => {
          return (
            <Route
              key={i}
              exact={route.exact}
              path={`${match.path}/${route.path}`}
              component={route.component}
            />
          )
        })}
      </Switch>
    </>
  )
}
