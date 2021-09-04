import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
  ImageStore,
  BackHandler
} from 'react-native';
import { Input, Item, Icon } from 'native-base';
import { RFValue } from 'react-native-responsive-fontsize';
import ChatBubble from '../Components/ChatBubble';
import IosHeaderFix from './../Components/IosheaderFix';
import { auth, db, firebase } from './../config';
// import ImagePicker from 'react-native-image-picker';
import ImagePicker from 'react-native-image-crop-picker';

const options = {
  title: 'Add Attachment',
  storageOptions: {
    skipBackup: true,
    path: 'images',
    quality: 0.5,
  },
};

export default class ChatScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      status: 'Pending',
      endConversation: false,
      company: '',
      cost: '0',

      user: null,

      messageContent: '',

      messages: [],

      uploadLoader: false,
    };
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
  }

  componentDidMount() {
    // console.warn(this.props.navigation.state.params)
    this.setState(this.props.navigation.state.params, () => {
      if (
        this.state.status === 'Successful' ||
        this.state.status === 'Failed'
      ) {
        this.setState({
          endConversation: true,
        });
      }

      auth.onAuthStateChanged(user => {
        console.warn(user);
        if (user) {
          this.setState({ user: user }, () => {
            this.markRead();
            this.getMessages();
          });
        }
      });

      console.warn('here is KEY:', this.state.chatKey);
    });
  }
  componentWillMount() {
    BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
  }

  handleBackButtonClick() {
    this.props.navigation.navigate('CustomNav');
    return true;
  }
  markRead = () => {
    db.ref(
      '/tradeRequests/' + this.state.user.uid + '/' + this.state.chatKey,
    ).update({
      read: true,
    });
    console.warn('Mark Read');
  };
  conversationList = [];

  getMessages = () => {
    db.ref(
      '/tradeRequests/' +
      this.state.user.uid +
      '/' +
      this.state.chatKey +
      '/messages',
    ).on('value', snap => {
      let conversationList = [];
      let convObject = {
        messages: [],
        // conversationKey: this.state.chatKey,
      };
      // console.warn("MSG", snap.val())
      if (snap.val()) {
        console.log('here', snap.val());

        const keys = Object.keys(snap.val());
        console.log('keys', keys);

        let messages = [];
        for (let i = 0; i < keys.length; i++) {
          // let currMsg = snap.val().messages[keys[i]]
          if (!snap.val()[keys[i]].deletedUser) {
            // console.log("!!!",snap.val()[keys[i]].deletedUser);

            messages.push(
              {
                msg: snap.val()[keys[i]],
                key: keys[i],
                conversationKey: this.state.chatKey,
              },
              // snap.val()[keys[i]]
            );

            convObject.messages.push({
              msg: snap.val()[keys[i]],
              key: keys[i],
              conversationKey: this.state.chatKey,
            });
          }
        }
        console.warn(messages);
        this.setState({ messages: messages });
      }
      conversationList.push(convObject);
    });
  };

  sendMessage = () => {
    console.warn('Send Message called');
    if (this.state.messageContent.length > 0) {
      console.warn(
        '/tradeRequests/' +
        this.state.user.uid +
        '/' +
        this.state.chatKey +
        '/messages',
      );
      db.ref(
        '/tradeRequests/' +
        this.state.user.uid +
        '/' +
        this.state.chatKey +
        '/messages',
      )
        .push({
          message: this.state.messageContent,
          sender: 'user',
          timestamp: new Date().toISOString(),
        })
        .then(() => {
          this.setState({
            messageContent: '',
          });

          db.ref('/requestLists/' + this.state.chatKey)
            .once('value')
            .then(snapshot => {
              db.ref('/requestLists/' + this.state.chatKey).update({
                unreadMessages: snapshot.val().unreadMessages + 1,
                lastUpdateTime: new Date().getTime(),
              });
            });

          db.ref(
            '/tradeRequests/' + this.state.user.uid + '/' + this.state.chatKey,
          ).update({
            updateTime: new Date().getTime(),
          });
        })
        .catch(err => {
          console.warn(err);
          alert.alert(
            'Error',
            'There was an error sending message, please try again later.',
          );
        });
    } else {
      console.warn('Message empty');
    }
  };

  uploadAttachment = () => {
    // ImagePicker.openPicker({
    //   multiple: true
    // }).then(images => {
    //   console.log("images",images);
    // });
    this.setState({
      uploadLoader: true
    })
    ImagePicker.openPicker({
      multiple: true
    }).then(images => {
      console.log("here", images.length);
      // Uri.fromFile(new File(image.path))

      for (let i = 0; i < images.length; i++) {
        const storage = firebase.storage();
        let imageId = parseInt(Date.now() + Math.random()).toString();
        // console.warn(response.uri);
        const imageRef = storage
          .ref(`attachments/${this.state.user.uid}`)
          .child(`rclabs-${imageId}`);
        this.uriToBlob(images[i].path)
          .then(blob => {
            imageRef.put(blob).then(() => {
              imageRef.getDownloadURL().then(url => {
                console.warn(url);
                db.ref(
                  '/tradeRequests/' +
                  this.state.user.uid +
                  '/' +
                  this.state.chatKey +
                  '/messages',
                )
                  .push({
                    url: url,
                    sender: 'user',
                    timestamp: new Date().toISOString(),
                  })
                  .then(() => {
                    this.setState({
                      uploadLoader: false,
                    });
                  })
                  .catch(err => {
                    Alert.alert(
                      'Error',
                      'There was an error uploading attachment, please try again.',
                    );
                    this.setState({
                      uploadLoader: false,
                    });
                  });
              });
            });
          })
          .catch(err => {
            console.warn(err.message);
            Alert.alert(
              'Error',
              'There was an error uploading attachment, please try again.',
            );
            this.setState({
              uploadLoader: false,
            });
          });
      }

    });

  };

  uriToBlob = uri => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.onload = function () {
        // return the blob
        resolve(xhr.response);
      };

      xhr.onerror = function () {
        console.warn('ERROR with blob');
        // something went wrong
        reject(new Error('uriToBlob failed'));
      };

      // this helps us get a blob
      xhr.responseType = 'blob';

      xhr.open('GET', uri, true);
      xhr.send(null);
    });
  };

  uploadToFirebase = blob => {
    console.warn('Uploading to firebase');
    let imageId = parseInt(Date.now() + Math.random()).toString();

    return new Promise((resolve, reject) => {
      var storageRef = firebase.storage().ref();

      storageRef
        .child(`attachments/${this.state.user.uid}/rclabs-${imageId}`)
        .put(blob, {
          contentType: 'image/jpeg',
        })
        .then(snapshot => {
          blob.close(); // let's free up the blob

          resolve(snapshot);
        })
        .catch(error => {
          console.warn(error);

          reject(error);
        });
    });
  };

  render() {
    return (
      <View style={{ width: '100%', flex: 1 }}>
        <View style={styles.header}>
          <IosHeaderFix />
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            <TouchableOpacity
              onPress={() => {
                this.props.navigation.navigate('CustomNav');
              }}>
              <Icon
                type="Ionicons"
                name="arrow-back"
                style={{ color: 'white' }}
              />
            </TouchableOpacity>
            <Text
              style={{ textAlign: 'center', color: 'white', fontWeight: 'bold' }}>
              Tech2Mart Support
            </Text>
            <View
              style={{
                height: 24,
                borderRadius: 12,
                backgroundColor: 'white',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Text
                style={{
                  color:
                    this.state.status === 'Pending'
                      ? '#00bcd4'
                      : this.state.status === 'Successful'
                        ? '#4caf50'
                        : '#f44336',
                  fontSize: RFValue(8),
                  paddingHorizontal: RFValue(7),
                  fontWeight: 'bold',
                }}>
                {this.state.status}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.subHeader}>
          <Text
            style={{
              textAlign: 'center',
              color: 'white',
              fontSize: RFValue(10),
            }}>
            {this.state.company}
          </Text>
          <Text
            style={{
              textAlign: 'center',
              color: 'white',
              fontSize: RFValue(10),
            }}>
            {this.state.company !== 'Withdrawal' ? 'N ' + this.state.cost : ''}
          </Text>
        </View>
        {Platform.OS === 'ios' ? (
          <KeyboardAvoidingView style={{ flex: 29 }} behavior="padding">
            <ScrollView
              style={{ flex: 1, width: '100%' }}
              contentContainerStyle={{
                paddingTop: RFValue(15),
                paddingBottom: RFValue(20),
              }}>
              {this.state.company !== 'Withdrawal' ? (
                <ChatBubble
                  color={this.state.color}
                  company={this.state.company}
                  logo={this.state.logo}
                  cardValue={this.state.cardValue}
                  dailyRate={this.state.dailyRate}
                  card={true}
                />
              ) : null}

              {this.state.messages.map((message, index) => {
                console.log('msg', message);

                return (
                  <ChatBubble
                    ID={message.key}
                    conversationKey={message.conversationKey}
                    content="Hello"
                    recieved={message.msg.sender !== 'user'}
                    image={message.msg.url ? message.msg.url : null}
                    content={message.msg.message}
                    time={message.msg.timestamp}
                    processing={
                      message.msg.processing ? message.msg.processing : false}
                  />
                );
              })}
              {/* <ChatBubble content="Hello" />
                        <ChatBubble content="How can I help you?" recieved />
                        <ChatBubble processing image="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR6RI4olGPQWTo2TYzIIMhNnXhmadVqPxEq5rPbkM2M4HvpzIsxgw" />
                        <ChatBubble content="Please wait we are verifying your card" recieved /> */}
            </ScrollView>
            {this.state.endConversation === false ? (
              <View style={styles.footer}>
                <TouchableOpacity
                  style={styles.attachButton}
                  activeOpacity={0.7}
                  onPress={() => {
                    this.uploadAttachment();
                  }}>
                  <Icon
                    type="FontAwesome"
                    name="paperclip"
                    style={{ color: 'rgb(130,130,130)', fontSize: RFValue(20) }}
                  />
                </TouchableOpacity>
                <Input
                  placeholder="Type your message"
                  style={styles.input}
                  multiline={true}
                  value={this.state.messageContent}
                  onChangeText={val => {
                    this.setState({ messageContent: val });
                  }}
                />
                <TouchableOpacity
                  style={styles.sendButton}
                  activeOpacity={0.7}
                  onPress={() => {
                    this.sendMessage();
                  }}>
                  <Icon
                    type="FontAwesome"
                    name="paper-plane"
                    style={{ color: 'white', fontSize: RFValue(20) }}
                  />
                </TouchableOpacity>
              </View>
            ) : (
                <View style={styles.footer}>
                  <Text
                    style={{
                      textAlign: 'center',
                      padding: RFValue(17),
                      fontSize: RFValue(13),
                    }}>
                    Case has been closed, you can not reply to this conversation
                    anymore.
                </Text>
                </View>
              )}
          </KeyboardAvoidingView>
        ) : (
            <View style={{ flex: 29 }}>
              <ScrollView
                style={{ flex: 1, width: '100%' }}
                contentContainerStyle={{
                  paddingTop: RFValue(15),
                  paddingBottom: RFValue(20),
                }}>
                {this.state.company !== 'Withdrawal' ? (
                  // <Text>text</Text>
                  <ChatBubble
                    color={this.state.color}
                    company={this.state.company}
                    logo={this.state.logo}
                    cardValue={this.state.cardValue}
                    dailyRate={this.state.dailyRate}
                    card={true}
                  />
                ) : null}

                {this.state.messages.map((message, index) => {
                  return (
                    <ChatBubble
                      key={index}
                      ID={message.key}
                      conversationKey={message.conversationKey}
                      content="Hello"
                      recieved={message.msg.sender !== 'user'}
                      image={message.msg.url ? message.msg.url : null
                      }
                      content={message.msg.message}
                      time={message.msg.timestamp}
                      processing={
                        message.msg.processing ? message.msg.processing : false
                      }
                    />
                  );
                })}
                {/* <ChatBubble content="Hello" />
                            <ChatBubble content="How can I help you?" recieved />
                            <ChatBubble processing image="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR6RI4olGPQWTo2TYzIIMhNnXhmadVqPxEq5rPbkM2M4HvpzIsxgw" />
                            <ChatBubble content="Please wait we are verifying your card" recieved /> */}
              </ScrollView>
              {this.state.endConversation === false ? (
                <View style={styles.footer}>
                  <TouchableOpacity
                    style={styles.attachButton}
                    activeOpacity={0.7}
                    onPress={() => {
                      this.uploadAttachment();
                    }}>
                    <Icon
                      type="FontAwesome"
                      name="paperclip"
                      style={{ color: 'rgb(130,130,130)', fontSize: RFValue(20) }}
                    />
                  </TouchableOpacity>
                  <Input
                    placeholder="Type your message"
                    style={styles.input}
                    multiline={true}
                    value={this.state.messageContent}
                    onChangeText={val => {
                      this.setState({ messageContent: val });
                    }}
                  />
                  <TouchableOpacity
                    style={styles.sendButton}
                    activeOpacity={0.7}
                    onPress={() => {
                      this.sendMessage();
                    }}>
                    <Icon
                      type="FontAwesome"
                      name="paper-plane"
                      style={{ color: 'white', fontSize: RFValue(20) }}
                    />
                  </TouchableOpacity>
                </View>
              ) : (
                  <View style={styles.footer}>
                    <Text
                      style={{
                        textAlign: 'center',
                        padding: RFValue(17),
                        fontSize: RFValue(13),
                      }}>
                      Case has been closed, you can not reply to this conversation
                      anymore.
                </Text>
                  </View>
                )}
            </View>
          )}

        {this.state.uploadLoader ? (
          <View
            style={{
              position: 'absolute',
              height: '100%',
              width: '100%',
              backgroundColor: 'rgba(0,0,0,0.4)',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <ActivityIndicator size="large" color="white" />
          </View>
        ) : null}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#9575CD',
    padding: RFValue(10),
  },
  footer: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,

    elevation: 3,
    width: '100%',
    backgroundColor: 'rgb(252,252,252)',
    flexDirection: 'row',
  },
  sendButton: {
    padding: RFValue(10),
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#9575CD',
  },
  input: {
    backgroundColor: 'rgb(252,252,252)',
    maxHeight: RFValue(120),
    padding: RFValue(15),
    paddingTop: RFValue(14),
    flex: 4,
  },
  attachButton: {
    backgroundColor: 'rgb(252,252,252)',
    padding: RFValue(10),
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subHeader: {
    backgroundColor: '#B39DDB',
    padding: RFValue(10),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
