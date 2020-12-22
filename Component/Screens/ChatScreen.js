import React, {Component} from 'react';
console.disableYellowBox = true;

import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ScrollView,
  Platform,
} from 'react-native';
import resp from 'rn-responsive-font';
import Spinner from 'react-native-loading-spinner-overlay';
import moment from 'moment';
import ImageModal from 'react-native-image-modal';
import requestCameraAndAudioPermission from './permission';
// import {ScrollView} from 'react-native-gesture-handler'
// import GiftedFireChat from 'react-native-gifted-fire-chat';
// import firebase from './firebase'
// import Backend from '../Backend'
// import AsyncStorage from '@react-native-community/async-storage';
import AsyncStorage from '@react-native-community/async-storage';
import {Badge, Fab, Icon} from 'native-base';

const IDs = '123456';
class ChatScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      messages: [],
      name: null,
      chatID: '124568',
      userId: '',
      userAccessToken: '',
      chatList: '',
      ischatList: false,
      spinner: '',
      fcmToken: '',
      PhoneNumber: '',
      mounted: false,
    };
    if (Platform.OS === 'android') {
      //Request required permissions from Android
      requestCameraAndAudioPermission().then((_) => {
        console.log('requested!');
      });
    }
    // this.handleBackButtonClicks= this.handleBackButtonClicks.bind(this);
  }
  showLoading() {
    this.setState({spinner: true});
  }

  componentDidMount = () => {
    this.focusListener = this.props.navigation.addListener('willFocus', () => {
      if (this.state.mounted) {
        this.getChatList(false);
      }
    });
    AsyncStorage.getItem('@user_id').then((userId) => {
      if (userId) {
        this.setState({userId: userId});
        console.log('Edit user id Dhasbord ====' + this.state.userId);
      }
    });
    AsyncStorage.getItem('@fcmtoken').then((token) => {
      console.log('FCM TOKEN' + token);
      if (token) {
        this.setState({fcmToken: token});
      }
    });
    AsyncStorage.getItem('@access_token').then((accessToken) => {
      if (accessToken) {
        this.setState({userAccessToken: accessToken, mounted: true});
        console.log('Edit access token ====' + accessToken);
        this.getChatList();
      }
    });
    AsyncStorage.getItem('@Phonecontacts').then((mobile) => {
      if (mobile) {
        this.setState({PhoneNumber: JSON.parse(mobile)});
      }
    });
  };
  showLoading() {
    this.setState({spinner: true});
  }

  hideLoading() {
    this.setState({spinner: false});
  }

  getChatList = (loading = true) => {
    if (loading) {
      this.showLoading();
    }
    var urlprofile = `https://www.cartpedal.com/frontend/web/api-message/chat-list?user_id=${this.state.userId}`;
    console.log('profileurl :' + urlprofile);
    fetch(urlprofile, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        device_id: '1234',
        device_token: this.state.fcmToken,
        device_type: 'android',
        Authorization: JSON.parse(this.state.userAccessToken),
      },
    })
      .then((response) => response.json())
      .then(async (responseData) => {
        if (responseData.code == '200') {
          this.hideLoading();
          // this.LoginOrNot();
          await this.setState({chatList: responseData.data, ischatList: true});
          console.log(JSON.stringify(this.state.chatList, null, 2));
        } else {
          // alert(responseData.data);
          this.hideLoading();
          console.log('logged user stories' + JSON.stringify(responseData));
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };
  componentWillUnmount() {
    // Backend.closeChat();
    this.focusListener.remove();
  }

  render() {
    const funct = this;
    // const chat =<GiftedFireChat messages={this.state.messages}onSend={firebase.send}user={this.user}></GiftedFireChat>

    // if (Platform.OS==='android') {
    //   return(
    //     <KeyboardAvoidingView style={{flex:0.9}} behavior='padding' keyboardVerticalOffset={30} enabled>
    //         {chat}
    //     </KeyboardAvoidingView>
    //   )
    //  }
    return (
      <SafeAreaView style={styles.container}>
        <Fab
          onPress={() => {
            this.props.navigation.navigate('NewContactListScreen', {
              userId: this.state.userId,
              PhoneNumber: this.state.PhoneNumber,
              fcmToken: this.state.fcmToken,
              userAccessToken: this.state.userAccessToken,
            });
          }}
          style={{backgroundColor: 'red'}}
          containerStyle={{marginBottom: 64, zIndex: 4}}
          position="bottomRight">
          <Icon type="MaterialCommunityIcons" name="message-text-outline" />
        </Fab>
        <Spinner
          visible={this.state.spinner}
          color="#F01738"
          // textContent={'Loading...'}
          textStyle={styles.spinnerTextStyle}
        />
        <View style={styles.headerView}>
          <View style={styles.BackButtonContainer}>
            <TouchableOpacity onPress={() => this.props.navigation.goBack()}>
              <Image
                source={require('../images/back_blck_icon.png')}
                style={styles.backButtonStyle}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.TitleContainer}>
            <Image
              source={require('../images/logo_cart_paddle.png')}
              style={styles.LogoIconStyle}
            />
            <TouchableOpacity
              style={{alignItems: 'center', justifyContent: 'center'}}>
              <Text style={styles.TitleStyle}>CartPadle</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.SearchContainer}
            onPress={() => {
              // this.props.navigation.navigate('SearchBarScreen')
            }}>
            <Image
              source={require('../images/search.png')}
              style={styles.SearchIconStyle}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.MainContentBox}>
          <ScrollView>
            <View>
              {this.state.ischatList
                ? this.state.chatList.map(function (v, i) {
                    return (
                      <TouchableOpacity
                        onPress={() => {
                          funct.props.navigation.navigate('ChatDetailScreen', {
                            userid: v.id,
                            username: v.name,
                            useravatar: v.avatar,
                          });
                        }}>
                        <View
                          style={{
                            flexDirection: 'row',
                            justifyContent: 'center',
                            borderBottomWidth: 0.5,
                            color: 'grey',
                          }}>
                          <View
                            style={{
                              alignSelf: 'center',
                              backgroundColor: 'white',
                              width: '95%',
                              flexDirection: 'row',
                              alignItems: 'center',
                            }}>
                            <View style={{padding: 10}}>
                              <ImageModal
                                imageBackgroundColor="transparent"
                                borderRadius={8}
                                style={styles.Styleimage}
                                source={
                                  v.avatar
                                    ? {uri: v.avatar}
                                    : require('../images/default_user.png')
                                }
                              />
                            </View>
                            <View
                              style={{
                                backgroundColor: 'white',
                                flexDirection: 'row',
                                width: '84%',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                              }}>
                              <View>
                                <Text style={styles.PersonNameStyle}>
                                  {v.name}
                                </Text>
                                {v.lastmsg?.txt_type === 'text' && (
                                  <Text style={styles.PersonNameStyle1}>
                                    {v.lastmsg?.body}
                                  </Text>
                                )}
                                {v.lastmsg?.txt_type === 'location' && (
                                  <View
                                    style={{
                                      flexDirection: 'row',
                                      alignItems: 'center',
                                    }}>
                                    <Icon
                                      name="location-pin"
                                      style={{
                                        fontSize: 20,
                                        color: 'grey',
                                        marginLeft: 8,
                                      }}
                                      type="MaterialIcons"
                                    />
                                    <Text
                                      style={[
                                        styles.PersonNameStyle1,
                                        {marginLeft: 4},
                                      ]}>
                                      Location
                                    </Text>
                                  </View>
                                )}
                                {v.lastmsg?.txt_type === 'file' && (
                                  <View
                                    style={{
                                      flexDirection: 'row',
                                      alignItems: 'center',
                                    }}>
                                    <Icon
                                      name="file-document"
                                      style={{
                                        fontSize: 20,
                                        color: 'grey',
                                        marginLeft: 8,
                                      }}
                                      type="MaterialCommunityIcons"
                                    />
                                    <Text
                                      style={[
                                        styles.PersonNameStyle1,
                                        {marginLeft: 4},
                                      ]}>
                                      Document
                                    </Text>
                                  </View>
                                )}
                                {v.lastmsg?.txt_type === 'image' && (
                                  <View
                                    style={{
                                      flexDirection: 'row',
                                      alignItems: 'center',
                                    }}>
                                    <Icon
                                      name="photo"
                                      style={{
                                        fontSize: 20,
                                        color: 'grey',
                                        marginLeft: 8,
                                      }}
                                      type="MaterialIcons"
                                    />
                                    <Text
                                      style={[
                                        styles.PersonNameStyle1,
                                        {marginLeft: 4},
                                      ]}>
                                      Photo
                                    </Text>
                                  </View>
                                )}
                                {v.lastmsg?.txt_type === 'video' && (
                                  <View
                                    style={{
                                      flexDirection: 'row',
                                      alignItems: 'center',
                                    }}>
                                    <Icon
                                      name="videocam"
                                      style={{
                                        fontSize: 20,
                                        color: 'grey',
                                        marginLeft: 8,
                                      }}
                                      type="MaterialIcons"
                                    />
                                    <Text
                                      style={[
                                        styles.PersonNameStyle1,
                                        {marginLeft: 4},
                                      ]}>
                                      Video
                                    </Text>
                                  </View>
                                )}
                                {v.lastmsg?.txt_type === 'audio' && (
                                  <View
                                    style={{
                                      flexDirection: 'row',
                                      alignItems: 'center',
                                    }}>
                                    <Icon
                                      name="headset"
                                      style={{
                                        fontSize: 20,
                                        color: 'grey',
                                        marginLeft: 8,
                                      }}
                                      type="MaterialIcons"
                                    />
                                    <Text
                                      style={[
                                        styles.PersonNameStyle1,
                                        {marginLeft: 4},
                                      ]}>
                                      Audio
                                    </Text>
                                  </View>
                                )}
                                {v.lastmsg?.txt_type === 'contact' && (
                                  <View
                                    style={{
                                      flexDirection: 'row',
                                      alignItems: 'center',
                                    }}>
                                    <Icon
                                      name="person"
                                      style={{
                                        fontSize: 20,
                                        color: 'grey',
                                        marginLeft: 8,
                                      }}
                                      type="MaterialIcons"
                                    />
                                    <Text
                                      style={[
                                        styles.PersonNameStyle1,
                                        {marginLeft: 4},
                                      ]}>
                                      Contact
                                    </Text>
                                  </View>
                                )}
                              </View>
                              <View>
                                <Text
                                  style={[
                                    styles.PersonNameStyle1,
                                    {marginTop: 0},
                                  ]}>
                                  {moment(v.lastmsg?.created_at).format(
                                    'hh:mm a',
                                  )}
                                </Text>
                                {v.unread !== '0' && (
                                  <View
                                    style={{
                                      backgroundColor: 'red',
                                      height: 24,
                                      width: 24,
                                      borderRadius: 12,
                                      justifyContent: 'center',
                                      alignItems: 'center',
                                      marginTop: 8,
                                      alignSelf: 'flex-end',
                                      marginRight: '28%',
                                    }}>
                                    <Text style={{color: 'white'}}>
                                      {v.unread}
                                    </Text>
                                  </View>
                                )}
                              </View>
                            </View>
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  })
                : null}
            </View>
          </ScrollView>
        </View>

        <View style={styles.TabBox}>
          <View style={styles.tabStyle}>
            <TouchableOpacity
              style={styles.tabButtonStyle}
              onPress={() => {
                this.props.navigation.navigate('DashBoardScreen');
              }}>
              <Image
                source={require('../images/home_inactive_icon.png')}
                style={styles.StyleHomeTab}
              />
              <Text style={styles.bottomInactiveTextStyle}>Home</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.tabButtonStyle}
              onPress={() => {
                this.props.navigation.navigate('OpenForPublicScreen');
              }}>
              <Image
                source={require('../images/group_inactive_icon.png')}
                style={styles.StyleOpenForPublicTab}
              />
              <Text style={styles.bottomInactiveTextStyle}>
                Open for Public
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.tabButtonStyle}
              onPress={() => {
                this.props.navigation.navigate('CartScreen');
              }}>
              <Image
                source={require('../images/cart_bag_inactive_icon.png')}
                style={styles.styleChartTab}
              />
              <Text style={styles.bottomInactiveTextStyleChart}>Cart</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.tabButtonStyle}
              onPress={() => {
                this.props.navigation.navigate('ChatScreen');
              }}>
              <Image
                source={require('../images/chat__active_icon.png')}
                style={styles.StyleChatTab}
              />
              <Text style={styles.bottomActiveTextStyle}>Chat</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.tabButtonStyle}
              onPress={() => {
                this.props.navigation.navigate('SettingScreen');
              }}>
              <Image
                source={require('../images/setting_inactive_icon.png')}
                style={styles.StyleSettingTab}
              />
              <Text style={styles.bottomInactiveTextStyle}>Setting</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#F6F9FE',
  },

  MainContentBox: {
    flex: 1,
  },
  row: {
    color: '#000',
    width: '100%',
    height: 100,
  },
  TabBox: {
    flex: 0.1,
    color: '#000',
  },
  BackButtonContainer: {
    flex: 0.2,
    marginLeft: 10,
    backgroundColor: 'white',
  },
  backButtonStyle: {
    margin: 10,
    height: 20,
    width: 20,
  },
  LogoIconStyle: {
    margin: 5,
    height: 30,
    width: 30,
  },
  SearchIconStyle: {
    margin: 5,
    marginRight: 20,
    height: 25,
    width: 25,
    alignSelf: 'flex-end',
  },
  TitleContainer: {
    flexDirection: 'row',
    flex: 0.6,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  TitleStyle: {
    fontWeight: 'bold',
    color: 'black',
    fontSize: resp(20),
    textAlign: 'center',
  },
  SearchContainer: {
    flex: 0.2,
    backgroundColor: '#fff',
  },
  headerView: {
    flex: 0.1,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    elevation: 20,
  },

  bottomActiveTextStyle: {
    color: '#FB3954',
    fontSize: resp(10),
    marginTop: 5,
    textAlign: 'center',
  },

  bottomInactiveTextStyleChart: {
    color: '#887F82',
    fontSize: resp(10),
    marginTop: 3,
    marginLeft: 8,
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
  },
  bottomInactiveTextStyle: {
    color: '#887F82',
    fontSize: resp(10),
    marginTop: 3,
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
  },
  StyleHomeTab: {
    marginTop: 5,
    width: 30,
    height: 28,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  Styleimage: {
    marginTop: 0,
    width: 60,
    height: 60,
    padding: 15,
  },
  StyleOpenForPublicTab: {
    marginTop: 11,
    marginRight: 10,
    width: 38,
    height: 23,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomVideoTextStyle: {
    color: '#887F82',
    fontSize: resp(8),
    marginRight: 10,
    marginTop: 3,
    textAlign: 'center',
  },
  styleChartTab: {
    marginTop: 9,
    width: 30,
    height: 30,
    marginLeft: 10,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomNotificationTextStyle: {
    color: '#887F82',
    fontSize: resp(8),
    marginLeft: 10,
    marginTop: 3,
    textAlign: 'center',
  },
  StyleChatTab: {
    marginTop: 9,
    width: 30,
    height: 30,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  StyleSettingTab: {
    marginTop: 9,
    width: 30,
    height: 30,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabStyle: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    height: 60,
    shadowColor: '#ecf6fb',
    elevation: 20,
    shadowColor: 'grey',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute', //Here is the trick
    bottom: 0,
  },
  tabButtonStyle: {
    flex: 0.25,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
  },
  PersonNameStyle: {
    width: resp(100),
    height: resp(20),
    color: '#000',
    fontWeight: 'bold',
    marginLeft: 10,
  },
  PersonNameStyle1: {
    width: resp(100),
    height: resp(20),
    color: 'grey',
    marginLeft: 12,
  },
});
export default ChatScreen;