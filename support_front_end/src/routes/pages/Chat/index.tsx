import { FC, useEffect, useState } from "react";
import {
  Badge,
  Button,
  Card,
  DatePicker,
  Drawer,
  Empty,
  Image,
  Input,
  InputNumber,
  Result,
  Tabs,
} from "antd";
import "../../../assets/style/styling.css";
import CustomScrollbars from "../../../util/CustomScrollbars";
import ChatUserList from "../../../containers/chat/ChatUserList";
import ContactList from "../../../containers/chat/ContactList";
import {
  ContactsFilled,
  EyeInvisibleFilled,
  MessageFilled,
  SmileOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import { useQuery } from "react-query";
import { transport } from "../../../util/Api";
import { ChatState, Topic, TopicStatus, User } from "../../../types";
import { useSelector } from "react-redux";
import { RootState } from "../../../appRedux/store";
import Communication from "./Communication";
import { Tab } from "rc-tabs/lib/interface";
import { css } from "@emotion/css";
import imgIcon from "../../img/icon-chat.png";
import dayjs, { Dayjs } from "dayjs";
import { useWorker } from "@koale/useworker";
import { filterTopics } from "./filterTopics";

const ChatPage: FC = () => {
  const [funcArray] = useWorker(filterTopics, {
    remoteDependencies: [
      "https://cdn.jsdelivr.net/npm/dayjs@1/dayjs.min.js", // dayjs
    ],
  });
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [contactList, setContactList] = useState<User[]>([]);
  const [topicsList, setTopics] = useState<Topic[]>([]);
  // do not touch this
  const [initOpenTopics, setOpenTopics] = useState<Topic[]>([]);
  const [initCompletedTopics, setCompletedTopics] = useState<Topic[]>([]);
  const [initUnreadTopics, setUnreadTopics] = useState<Topic[]>([]);

  const [filteredContacts, onFilterContact] = useState<User[]>([]);
  const [filteredTopics, onFilterTopic] = useState<Topic[]>([]);
  const [filteredTopicsSubject, onFilterTopicSubject] = useState<Topic[]>([]);

  const [subjectUnreadValue, setSubjectUnreadValue] = useState("");
  const [filterOpenTopics, onFilterOpenTopic] = useState<Topic[]>([]);
  const [filterCompTopics, onFilterCompTopic] = useState<Topic[]>([]);

  const [subjectValue, setSubjectValue] = useState("");
  const [filterDateUnreadTopics, onFilterDateUnreadTopic] = useState<Topic[]>(
    []
  );

  // handle search msg topics
  const [OpenTopicMsg, setOpenTopicMsg] = useState<Topic[]>([]);
  const [CompletTopicMsg, setCompletTopicMsg] = useState<Topic[]>([]);
  const [value, setValue] = useState("");

  const [dateValue, setDateValue] = useState<Dayjs | null | string>(null);
  const [filterDateTopics, onFilterDateTopic] = useState<Topic[]>([]);
  const [drawerState, onShowUsers] = useState(false);
  const [state, setState] = useState<ChatState>({
    loader: false,
    userNotFound: "No user found",
    drawerState: false,
    selectedSectionId: selectedTopic?.id != null ? selectedTopic.id : 0,
    selectedTabIndex: 1,
    selectedTopic: null,
  });
  const user = useSelector<RootState, User | undefined>(
    (state) => state.auth.user
  );
  const { data: users } = useQuery<User[]>(
    "users",
    async () => await transport.get(`/users/chef`).then((res) => res.data)
  );
  const { data: topics } = useQuery<Topic[]>(
    "topics",
    async () =>
      await transport
        .get(`/conversations/topics/${user?.id ?? 0}`)
        .then((res) => res.data),
    {
      refetchInterval: 3000,
    }
  );

  useQuery<Topic[]>(
    ["search-msgTopic", value],
    async () => {
      return await transport
        .post(`/conversations/search/${user?.id ?? 0}?msg=${value}`)
        .then((res) => res.data);
    },
    {
      enabled: value.length > 0,
      onSuccess(data) {
        const topic = data?.filter((tpc) => tpc.status === TopicStatus.OPEN);
        const completeTopic = data?.filter(
          (tpc) => tpc.status === TopicStatus.COMPLETED
        );
        if (topic !== undefined) setOpenTopicMsg(topic);
        if (completeTopic !== undefined) setCompletTopicMsg(completeTopic);
      },
    }
  );

  useEffect(() => {
    if (selectedTopic != null)
      setState({
        ...state,
        selectedSectionId: selectedTopic?.id,
      });
    if (users != null) {
      setContactList(users);
      onFilterContact(users);
    }
    if (topics != null) {
      setTopics(topics);
      onFilterTopic(topics);
    }
  }, [selectedTopic, users, topics]);

  useEffect(() => {
    async function fetchJSXElement() {
      if (filteredTopics.length > 0) {
        const [openTopics, completedTopics, unreadTopics] = await funcArray(
          filteredTopics
        );
        setOpenTopics(openTopics);
        setCompletedTopics(completedTopics);
        setUnreadTopics(unreadTopics);
      }
    }
    void fetchJSXElement();
  }, [filteredTopics.length, filteredTopics]);

  const ChatUsers = ({
    topics,
    contactList,
  }: {
    topics: Topic[];
    contactList: User[];
  }) => {
    const items: Tab[] = [
      {
        label: (
          <>
            <MessageFilled />
            Open <Badge className="ml-2" count={initOpenTopics.length} />
          </>
        ),
        key: "1",
        children: (
          <>
            <div className="spaceblock">
              <div
                style={{
                  position: "relative",
                  color: "#FFF",
                  zIndex: 3,
                }}
              >
                <InputNumber
                  style={{ width: "100%", marginBottom: 5 }}
                  placeholder="search by id"
                  type="number"
                  onChange={(value) => {
                    if (value !== null) {
                      const topic = topicsList.find(
                        (topic) =>
                          topic.id === value &&
                          topic.status === TopicStatus.OPEN
                      );
                      if (topic !== undefined) onFilterTopic([topic]);
                    } else {
                      onFilterTopic(topicsList);
                    }
                  }}
                />
                <DatePicker
                  style={{ width: "100%", marginBottom: 5 }}
                  placeholder="search by date"
                  allowClear
                  onChange={(value) => setDateValue(value)}
                  onSelect={(value) => {
                    setDateValue(value.format("DD/MM/YYYY"));
                    if (value !== null) {
                      const topic = initOpenTopics.filter(
                        (topic) =>
                          dayjs(topic.createdAt).format("DD/MM/YYYY") ===
                          value.format("DD/MM/YYYY")
                      );
                      onFilterDateTopic(topic);
                    } else {
                      onFilterDateTopic(initOpenTopics);
                    }
                  }}
                />
                <Input
                  style={{ width: "100%", marginBottom: 5 }}
                  placeholder="search by subject"
                  type="text"
                  allowClear
                  onChange={(text) => {
                    setSubjectValue(text.target.value);
                    if (text !== null) {
                      const topic = initOpenTopics.filter((topic) =>
                        topic.subject
                          .toLowerCase()
                          .includes(text.target.value.toLowerCase())
                      );
                      if (topic !== undefined) onFilterOpenTopic(topic);
                    } else {
                      onFilterOpenTopic(initOpenTopics);
                    }
                  }}
                />
                <Input
                  key={2}
                  allowClear
                  onChange={(text) => setValue(text.target.value)}
                  placeholder="Search in messages"
                  style={{ width: "100%", marginBottom: 5 }}
                />
              </div>
            </div>
            <CustomScrollbars className="chat-sidenav-scroll-tab-1">
              {topics.length === 0 ? (
                <Empty />
              ) : initOpenTopics.length === 0 ? (
                <Result
                  icon={<SmileOutlined />}
                  title="There is no open topics"
                />
              ) : (
                <ChatUserList
                  topics={
                    dateValue !== null
                      ? filterDateTopics
                      : subjectValue.length > 0
                      ? filterOpenTopics
                      : value.length > 0
                      ? OpenTopicMsg
                      : initOpenTopics
                  }
                  selectedSectionId={state.selectedSectionId}
                  onSelectTopic={setSelectedTopic}
                />
              )}
            </CustomScrollbars>
          </>
        ),
      },
      {
        label: (
          <>
            <MessageFilled />
            Completed{" "}
            <Badge
              style={{ backgroundColor: "#52c41a" }}
              className="ml-2"
              count={initCompletedTopics.length}
            />
          </>
        ),
        key: "2",
        children: (
          <>
            <div className="spaceblock">
              <div
                style={{
                  position: "relative",
                  color: "#FFF",
                  zIndex: 3,
                }}
              >
                <InputNumber
                  style={{ width: "100%", marginBottom: 5 }}
                  type="number"
                  placeholder="search by id"
                  onChange={(value) => {
                    if (value !== null) {
                      const topic = topicsList.find(
                        (topic) =>
                          topic.id === value &&
                          topic.status === TopicStatus.COMPLETED
                      );
                      if (topic !== undefined) onFilterTopic([topic]);
                    } else {
                      onFilterTopic(topicsList);
                    }
                  }}
                />
                <DatePicker
                  style={{ width: "100%", marginBottom: 5 }}
                  placeholder="search by date"
                  allowClear
                  onChange={(value) => setDateValue(value)}
                  onSelect={(value) => {
                    setDateValue(value.format("DD/MM/YYYY"));
                    if (value !== null) {
                      const topic = initCompletedTopics.filter(
                        (topic) =>
                          dayjs(topic.createdAt).format("DD/MM/YYYY") ===
                          value.format("DD/MM/YYYY")
                      );
                      onFilterDateTopic(topic);
                    } else {
                      onFilterDateTopic(initCompletedTopics);
                    }
                  }}
                />
                <Input
                  style={{ width: "100%", marginBottom: 5 }}
                  placeholder="search by subject"
                  type="text"
                  allowClear
                  onChange={(text) => {
                    setSubjectValue(text.target.value);
                    if (text !== null) {
                      const topic = initCompletedTopics.filter((topic) =>
                        topic.subject
                          .toLowerCase()
                          .includes(text.target.value.toLowerCase())
                      );
                      if (topic !== undefined) onFilterCompTopic(topic);
                    } else {
                      onFilterCompTopic(initCompletedTopics);
                    }
                  }}
                />
                <Input
                  key={2}
                  allowClear
                  onChange={(text) => setValue(text.target.value)}
                  placeholder="Search in messages"
                  style={{ width: "100%", marginBottom: 5 }}
                />
              </div>
            </div>
            <CustomScrollbars className="chat-sidenav-scroll-tab-1">
              {topics.length === 0 ? (
                <Empty />
              ) : initCompletedTopics.length === 0 ? (
                <Result
                  icon={<SmileOutlined />}
                  title="There is no complete topics "
                />
              ) : (
                <ChatUserList
                  topics={
                    dateValue !== null
                      ? filterDateTopics
                      : subjectValue.length > 0
                      ? filterCompTopics
                      : value.length > 0
                      ? CompletTopicMsg
                      : initCompletedTopics
                  }
                  selectedSectionId={state.selectedSectionId}
                  onSelectTopic={setSelectedTopic}
                />
              )}
            </CustomScrollbars>
          </>
        ),
      },
      {
        label: (
          <>
            <ContactsFilled />
            Contacts
          </>
        ),
        key: "3",
        children: (
          <>
            {contactList.length === 0 ? (
              <div className="p-5">{state.userNotFound}</div>
            ) : (
              <>
                <div
                  style={{
                    position: "relative",
                    color: "#FFF",
                    zIndex: 3,
                  }}
                >
                  <Input.Search
                    allowClear
                    style={{ width: "100%", marginBottom: 5 }}
                    placeholder="search by entity"
                    onChange={(e) => {
                      if (e.target.value.trim().length > 0) {
                        onFilterContact(
                          contactList.filter((contact) =>
                            contact.entity?.name
                              ?.toLowerCase()
                              .includes(e.target.value.toLowerCase())
                          )
                        );
                      } else {
                        onFilterContact(contactList);
                      }
                    }}
                  />
                </div>
                <CustomScrollbars className="chat-sidenav-scroll-tab-2">
                  <ContactList
                    contactList={filteredContacts.filter(
                      (contact) =>
                        contact.id !== user?.id && contact.entity !== null
                    )}
                    selectedSectionId={state.selectedSectionId}
                  />
                </CustomScrollbars>
              </>
            )}
          </>
        ),
      },
      {
        label: (
          <>
            <EyeInvisibleFilled />
            Unread <Badge className="ml-2" count={initUnreadTopics.length} />
          </>
        ),
        key: "4",
        children: (
          <>
            <div className="spaceblock">
              <div
                style={{
                  position: "relative",
                  color: "#FFF",
                  zIndex: 3,
                }}
              >
                <InputNumber
                  style={{ width: "100%", marginBottom: 5 }}
                  type="number"
                  placeholder="search by topic"
                  onChange={(value) => {
                    if (value !== null) {
                      const topic = topicsList.find(
                        (topic) => topic.id === value
                      );
                      if (topic !== undefined) onFilterTopic([topic]);
                    } else {
                      onFilterTopic(topicsList);
                    }
                  }}
                />
                <DatePicker
                  style={{ width: "100%", marginBottom: 5 }}
                  placeholder="search by date"
                  allowClear
                  onChange={(value) => setDateValue(value)}
                  onSelect={(value) => {
                    setDateValue(value.format("DD/MM/YYYY"));
                    if (value !== null) {
                      const topic = topicsList.filter(
                        (topic) =>
                          dayjs(topic.createdAt).format("DD/MM/YYYY") ===
                          value.format("DD/MM/YYYY")
                      );
                      onFilterDateUnreadTopic(topic);
                    } else {
                      onFilterDateUnreadTopic(topicsList);
                    }
                  }}
                />
                <Input
                  style={{ width: "100%", marginBottom: 5 }}
                  placeholder="search by subject"
                  type="text"
                  allowClear
                  onChange={(text) => {
                    setSubjectUnreadValue(text.target.value);
                    if (text !== null) {
                      const topic = initUnreadTopics.filter((topic) =>
                        topic.subject
                          .toLowerCase()
                          .includes(text.target.value.toLowerCase())
                      );
                      if (topic !== undefined) onFilterTopicSubject(topic);
                    } else {
                      onFilterTopicSubject(initUnreadTopics);
                    }
                  }}
                />
              </div>
            </div>
            <CustomScrollbars className="chat-sidenav-scroll-tab-1">
              {topics.length === 0 ? (
                <Empty />
              ) : initUnreadTopics.length === 0 ? (
                <Result
                  icon={<SmileOutlined />}
                  title="There is no unread topics "
                />
              ) : (
                <ChatUserList
                  topics={
                    dateValue !== null
                      ? filterDateUnreadTopics
                      : subjectUnreadValue.length > 0
                      ? filteredTopicsSubject
                      : initUnreadTopics
                  }
                  selectedSectionId={state.selectedSectionId}
                  onSelectTopic={setSelectedTopic}
                />
              )}
            </CustomScrollbars>
          </>
        ),
      },
    ];
    return (
      <Card
        bordered={false}
        className={css`
          padding-left: 0px !important;
        `}
        style={{ width: "auto", height: "100%" }}
      >
        <Tabs tabPosition={"left"} defaultActiveKey="1" items={items} />
      </Card>
    );
  };

  const { loader } = state;
  return (
    <div
      className="main-content"
      style={{ display: "flex", flexDirection: "column" }}
    >
      <div className="app-module chat-module">
        <div
          className="chat-module-box"
          style={{ display: "flex", flexDirection: "row" }}
        >
          <Drawer
            placement="right"
            closable={false}
            open={drawerState}
            size={"large"}
            onClose={() => onShowUsers(false)}
            className="drawer-module"
          >
            {ChatUsers({
              topics: topicsList,
              contactList,
            })}
          </Drawer>
          <div className="d-block d-lg-none"></div>
          <div style={{ flex: 19 }} className="chat-sidenav d-none d-lg-flex">
            {ChatUsers({
              topics: topicsList,
              contactList,
            })}
          </div>
          {loader ? (
            <div className="loader-view">
              <SyncOutlined style={{ fontSize: "2rem" }} spin />
            </div>
          ) : selectedTopic === null ? (
            <Card className="chat-box">
              <div className="comment-box">
                <div className="fs-80" style={{ width: 79, height: 100 }}>
                  {/* <i
                      className="icon icon-chat text-muted"
                      style={{ color: "grey" }}
                    /> */}
                  <Image src={imgIcon} />
                </div>
                <h1 className="text-muted" style={{ color: "grey" }}>
                  Select User to start Chat
                </h1>
                <Button
                  className="button-block"
                  type="primary"
                  onClick={() => onShowUsers(true)}
                >
                  Select User to start Chat
                </Button>
              </div>
            </Card>
          ) : (
            <div className="chat-box" style={{height:'100%'}}>
              <Communication
                onShowUsers={onShowUsers}
                selectedTopic={selectedTopic}
                onSelectTopic={setSelectedTopic}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
