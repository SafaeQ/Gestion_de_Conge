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
import CustomScrollbars from "../../../util/CustomScrollbars";
import ChatUserList from "../../../containers/chat/ChatUserList";
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
import ContactList from "../../../containers/chat/ContactList";
import { Tab } from "rc-tabs/lib/interface";
import imgIcon from "../../img/icon-chat.png";
import "../../../assets/style/styling.css";
import dayjs, { Dayjs } from "dayjs";
import { css } from "@emotion/css";

const ChatPage: FC = () => {
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [contactList, setContactList] = useState<User[]>([]);
  const [topicsList, setTopics] = useState<Topic[]>([]);

  const [filteredContacts, onFilterContact] = useState<User[]>([]);
  const [filteredTopics, onFilterTopic] = useState<Topic[]>([]);

  const [filterOpenTopics, onFilterOpenTopic] = useState<Topic[]>([]);
  const [filterCompTopics, onFilterCompTopic] = useState<Topic[]>([]);
  const [subjectValue, setSubjectValue] = useState("");
  const [subjectUnreadValue, setSubjectUnreadValue] = useState("");
  const [dateValue, setDateValue] = useState<Dayjs | null | string>(null);
  const [filterDateTopics, onFilterDateTopic] = useState<Topic[]>([]);
  const [filterDateUnreadTopics, onFilterDateUnreadTopic] = useState<Topic[]>(
    []
  );
  const [filteredTopicsSubject, onFilterTopicSubject] = useState<Topic[]>([]);

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
    async () => await transport.get(`/users/support`).then((res) => res.data)
  );
  const { data: topics } = useQuery<Topic[]>(
    "topics",
    async () =>
      await transport
        .get(`/conversations/topics/${user?.id ?? 0}`)
        .then((res) => res.data),
    {
      refetchInterval: 2000,
    }
  );

  useEffect(() => {
    if (selectedTopic != null)
      setState({
        ...state,
        selectedSectionId: selectedTopic?.id,
      });
  }, [selectedTopic]);

  useEffect(() => {
    if (users != null) {
      setContactList(users);
      onFilterContact(users);
    }
    if (topics != null) {
      setTopics(topics);
      onFilterTopic(topics);
    }
  }, [users, topics]);

  const ChatUsers = ({
    topics,
    contactList,
  }: {
    topics: Topic[];
    contactList: User[];
  }) => {
    const filteredOpenTopics = filteredTopics.filter(
      (topic) => topic.status === TopicStatus.OPEN
    );
    const filteredCompletedTopics = filteredTopics.filter(
      (topic) => topic.status === TopicStatus.COMPLETED
    );
    const filteredunreadTopics = filteredTopics.filter(
      (topic) => topic.unreadMessages > 0
    );
    const items: Tab[] = [
      {
        label: (
          <>
            <MessageFilled />
            Open{" "}
            <Badge
              className="ml-2"
              count={
                topicsList.filter((t) => t.status === TopicStatus.OPEN).length
              }
            />
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
                  width: "100%",
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
                      const topic = filteredOpenTopics.filter(
                        (topic) =>
                          dayjs(topic.createdAt).format("DD/MM/YYYY") ===
                          value.format("DD/MM/YYYY")
                      );
                      onFilterDateTopic(topic);
                    } else {
                      onFilterDateTopic(filteredOpenTopics);
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
                      const topic = filteredOpenTopics.filter((topic) =>
                        topic.subject
                          .toLowerCase()
                          .includes(text.target.value.toLowerCase())
                      );
                      if (topic !== undefined) onFilterOpenTopic(topic);
                    } else {
                      onFilterOpenTopic(filteredOpenTopics);
                    }
                  }}
                />
              </div>
            </div>
            <CustomScrollbars className="chat-sidenav-scroll-tab-1">
              {topics.length === 0 ? (
                <Empty />
              ) : filteredOpenTopics.length === 0 ? (
                <Result
                  icon={<SmileOutlined />}
                  title="There is no open topics "
                />
              ) : (
                <ChatUserList
                  topics={
                    dateValue !== null
                      ? filterDateTopics
                      : subjectValue.length > 0
                      ? filterOpenTopics
                      : filteredOpenTopics
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
              count={
                topicsList.filter((t) => t.status === TopicStatus.COMPLETED)
                  .length
              }
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
                  width: "100%",
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
                      const topic = filteredCompletedTopics.filter(
                        (topic) =>
                          dayjs(topic.createdAt).format("DD/MM/YYYY") ===
                          value.format("DD/MM/YYYY")
                      );
                      onFilterDateTopic(topic);
                    } else {
                      onFilterDateTopic(filteredCompletedTopics);
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
                      const topic = filteredCompletedTopics.filter((topic) =>
                        topic.subject
                          .toLowerCase()
                          .includes(text.target.value.toLowerCase())
                      );
                      if (topic !== undefined) onFilterCompTopic(topic);
                    } else {
                      onFilterCompTopic(filteredCompletedTopics);
                    }
                  }}
                />
              </div>
            </div>
            <CustomScrollbars className="chat-sidenav-scroll-tab-1">
              {topics.length === 0 ? (
                <Empty />
              ) : filteredCompletedTopics.length === 0 ? (
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
                      : filteredCompletedTopics
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
                    placeholder="search by name"
                    onChange={(e) => {
                      if (e.target.value.trim().length > 0) {
                        onFilterContact(
                          contactList.filter((contact) =>
                            contact.name
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
                      (contact) => contact.id !== user?.id
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
            Unread{" "}
            <Badge className="ml-2" count={filteredunreadTopics.length} />
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
                  width: "100%",
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
                      const topic = filteredunreadTopics.filter(
                        (topic) =>
                          dayjs(topic.createdAt).format("DD/MM/YYYY") ===
                          value.format("DD/MM/YYYY")
                      );
                      onFilterDateUnreadTopic(topic);
                    } else {
                      onFilterDateUnreadTopic(filteredunreadTopics);
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
                      const topic = filteredunreadTopics.filter((topic) =>
                        topic.subject
                          .toLowerCase()
                          .includes(text.target.value.toLowerCase())
                      );
                      if (topic !== undefined) onFilterTopicSubject(topic);
                    } else {
                      onFilterTopicSubject(filteredunreadTopics);
                    }
                  }}
                />
              </div>
            </div>
            <CustomScrollbars className="chat-sidenav-scroll-tab-1">
              {topics.length === 0 ? (
                <Empty />
              ) : filteredunreadTopics.length === 0 ? (
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
                      : filteredunreadTopics
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
        <Tabs
          animated={true}
          tabPosition={"left"}
          className="tabs-half"
          defaultActiveKey="1"
          items={items}
        />
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
            onClose={() => onShowUsers(false)}
            className="drawer-module"
            size={"large"}
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
            <div className="chat-box">
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
