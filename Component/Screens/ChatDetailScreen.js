import React from 'react';
import {Container, Icon, View} from 'native-base';
import {
  ScrollView,
  Image,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  PermissionsAndroid,
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import {TextInput} from 'react-native-gesture-handler';
import DocumentPicker from 'react-native-document-picker';
import PushNotification from 'react-native-push-notification';
import ImagePicker from 'react-native-image-picker';
import ImageCropPicker from 'react-native-image-crop-picker';
import resp from 'rn-responsive-font';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import {DocumentDirectoryPath, readFile} from 'react-native-fs';
import Geolocation from '@react-native-community/geolocation';
import axios from 'axios';
import ImageModal from 'react-native-image-modal';
import Menu, {MenuItem} from 'react-native-material-menu';
import Clipboard from '@react-native-community/clipboard';
import Toast from 'react-native-simple-toast';

const audioRecorderPlayer = new AudioRecorderPlayer();

import {MessageComponent} from '../Component/MessageComponent';
import {
  locationPermission,
  recordingPermissions,
} from '../Component/Permissions';

// import firebase from 'react-native-firebase';
let width = Dimensions.get('window').width;
let height = Dimensions.get('window').height;
var firebasemsg;
var isMsg = false;
var ModalState = false;

class ChatDetailScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      height: 40,
      open: false,
      message: '',
      chatList: {messages: []},
      ischatList: false,
      fcmToken: '',
      getNotify: '',
      firebaseMsg: '',
      isNotify: false,
      recievedmsg: '',
      recording: false,
      forwardMessageIds: [],
      userAccessToken:'',
      selectedMode: false,
      copyTexts: [],
      userId:'',
      page: 1,
    };
    console.log('ttt', JSON.stringify(this.props));
  }

  toggleSelectedMode = () => {
    this.setState((p) => ({
      ...p,
      selectedMode: !p.selectedMode,
      forwardMessageIds: [],
    }));
  };

  appendMessages = (messageId) => {
    this.setState((p) => ({
      ...p,
      forwardMessageIds: [...p.forwardMessageIds, messageId],
    }));
  };

  removeMessages = async (messageId) => {
    await this.setState((p) => ({
      ...p,
      forwardMessageIds: p.forwardMessageIds.filter((i) => i !== messageId),
      copyTexts: p.copyTexts.filter((i) => i.id !== messageId),
    }));
    if (this.state.forwardMessageIds.length === 0) {
      this.setState({selectedMode: false});
    }
  };

  copyText = ({id, text}) => {
    this.setState((p) => ({...p, copyTexts: [...p.copyTexts, {id, text}]}));
  };

  copyToClipboard = () => {
    let message = '';
    let count = 0;
    this.state.copyTexts.map((i) => {
      message = message + '\n' + i.text;
      count = count + 1;
    });
    Toast.show(`${count} messages copied`, 2000);
    Clipboard.setString(message);
    this.setState({
      selectedMode: false,
      forwardMessageIds: [],
      copyTexts: [],
    });
  };

  componentDidMount = () => {
    let test;
    var _this = this;

    AsyncStorage.getItem('@user_id').then((userId) => {
      if (userId) {
        this.setState({userId: userId});
        console.log('Edit user id Dhasbord ====' + this.state.userId);
      }
    });
    AsyncStorage.getItem('@fcmtoken').then((token) => {
      console.log('Edit user id token=' + token);
      if (token) {
        this.setState({fcmToken: token});
      }
    });
    AsyncStorage.getItem('@access_token').then((accessToken) => {
      if (accessToken) {
        this.setState({userAccessToken: accessToken});
        console.log('Edit access token ====' + accessToken);
        this.getConversationList();
      }
    });
    AsyncStorage.getItem('@Phonecontacts').then((mobile) => {
      if (mobile) {
        this.setState({PhoneNumber: JSON.parse(mobile)});
      }
    });
  };

  componentDidUpdate = () => {
    PushNotification.configure({
      onRegister: function (token) {
        //process token
      },
      onNotification: function (notification) {
        this.getConversationList();
        console.log('Asd', notification);
        isMsg = true;
        firebasemsg = notification.message;
        this.setState({firebaseMsg: JSON.parse(notification.message)});
        this.setState({recievedmsg: this.state.firebaseMsg.msg});
      }.bind(this),
    });

    console.log('sss', this.state.recievedmsg);
  };

  getConversationList = () => {
    let formData = new FormData();

    formData.append('user_id', this.state.userId);
    formData.append('toid', this.props.navigation.state.params.userid);
    formData.append('msg_type', '0');
    // formData.append('page', this.state.page);

    fetch('https://www.cartpedal.com/frontend/web/api-message/conversation', {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
        device_id: '1234',
        device_token: this.state.fcmToken,
        device_type: 'android',
        Authorization: JSON.parse(this.state.userAccessToken),
      },
      body: formData,
    })
      .then((response) => response.json())
      .then((responseData) => {
        if (responseData.code == '200') {
          this.setState({chatList: responseData.data, ischatList: true});
          this.state.chatList.messages.map(function (v, i) {
            if (v.fattach !== null) {
              // console.log('asdas', v.fattach.attach);
            }
          });
        } else {
          // alert(responseData.data);

          console.log('logged user stories' + JSON.stringify(responseData));
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  sendMessage = () => {
    this.setState({message: '', height: 40});
    const messageToSent = {
      ...newMessage,
      msg_type: 'text',
      fmsg: this.state.message,
      time: new Date(),
    };
    this.setState((p) => ({
      chatList: {
        ...p.chatList,
        messages: [...p.chatList.messages, messageToSent],
      },
      ischatList: true,
    }));
    var raw = JSON.stringify({
      user_id: this.state.userId,
      toid: this.props.navigation.state.params.userid,
      msg_type: 'text',
      body: this.state.message,
      reply_id: '0',
      upload: [],
    });
    fetch('https://www.cartpedal.com/frontend/web/api-message/sent-message', {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
        device_id: '1234',
        device_token: this.state.fcmToken,
        device_type: 'android',
        Authorization: JSON.parse(this.state.userAccessToken),
      },
      body: raw,
    })
      .then((response) => response.json())
      .then((responseData) => {
        if (responseData.code === 200) {
          // console.log('asda', responseData);
          this.getConversationList();
        } else {
          console.log('logged user stories' + JSON.stringify(responseData));
        }
      })

      .catch((error) => {
        console.error(error);
      });
  };

  uploadFileApi = (datas) => {
    this.setState({open: false});

    const messageToSent = {
      ...newMessage,
      msg_type: 'file',
      fmsg: '',
      fattach: {
        ...newMessage.fattach,
        attach: `${datas.path}.${datas.type.split('/')[1]}`,
      },
      time: new Date(),
    };
    this.setState((p) => ({
      chatList: {
        ...p.chatList,
        messages: [...p.chatList.messages, messageToSent],
      },
      ischatList: true,
    }));

    var data = {
      user_id: this.state.userId,
      toid: this.props.navigation.state.params.userid,
      msg_type: 'file',
      reply_id: 0,
      body: datas.type,
      upload: [
        {
          path: `${datas.path}.${datas.type.split('/')[1]}`,
          caption: '',
          data: datas.data,
        },
      ],
    };

    fetch('https://www.cartpedal.com/frontend/web/api-message/sent-message', {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
        device_id: '1234',
        device_token: '1111',
        device_type: 'android',
        Authorization: JSON.parse(this.state.userAccessToken),
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((responseData) => {
        if (responseData.code === 200) {
          // console.log('asda', responseData);
          // this.LoginOrNot();
          //   alert("Message sent succesfully")

          this.getConversationList();
        } else {
          // alert(responseData.data);

          console.log('logged user stories' + JSON.stringify(responseData));
        }
      })

      .catch((error) => {
        console.error(error);
      });
  };

  sendVideo = async (data) => {
    await this.setState({open: false});
    const messageToSent = {
      ...newMessage,
      msg_type: 'video',
      fmsg: '',
      fattach: {...newMessage.fattach, attach: data.path},
      time: new Date(),
    };
    this.setState((p) => ({
      chatList: {
        ...p.chatList,
        messages: [...p.chatList.messages, messageToSent],
      },
      ischatList: true,
    }));
    var data = {
      user_id: this.state.userId,
      toid: this.props.navigation.state.params.userid,
      msg_type: 'video',
      reply_id: 0,
      body: '',
      upload: [
        {
          path: data.path,
          caption: '',
          data: data.data,
        },
      ],
    };

    fetch('https://www.cartpedal.com/frontend/web/api-message/sent-message', {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
        device_id: '1234',
        device_token: '1111',
        device_type: 'android',
        Authorization: JSON.parse(this.state.userAccessToken),
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((responseData) => {
        if (responseData.code === 200) {
          //   console.log('asda', responseData);
          // this.LoginOrNot();
          //   alert("Message sent succesfully")

          this.getConversationList();
        } else {
          // alert(responseData.data);

          console.log('logged user stories' + JSON.stringify(responseData));
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  selectOneFile = () => {
    //Opening Document Picker for selection of one file
    try {
      const res = DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
      }).then(async (data) => {
        this.setState({open: false});
        // console.log(data);
        // FileViewer.open(data.uri, {showOpenWithDialog: true});
        const base64string = await readFile(data.uri, 'base64');
        const newData = {
          path: data.uri,
          data: base64string,
          type: data.type,
        };
        this.uploadFileApi(newData);
      });
      //Printing the log realted to the file
      console.log('res : ' + JSON.stringify(res));
      console.log('URI : ' + res.uri);
      console.log('Type : ' + res.type);
      console.log('File Name : ' + res.name);
      console.log('File Size : ' + res.size);
      //Setting the state to show single file attributes
    } catch (err) {
      //Handling any exception (If any)
      if (DocumentPicker.isCancel(err)) {
        //If user canceled the document selection
        alert('Canceled from single doc picker');
      } else {
        //For Unknown Error

        throw err;
      }
    }
  };

  selectOneFile1 = () => {
    //Opening Document Picker for selection of one file
    try {
      const res = DocumentPicker.pick({
        type: [DocumentPicker.types.audio],
      }).then(async (data) => {
        // console.log(data)
        console.log(data);

        const base64 = await readFile(data.uri, 'base64');
        const newData = {
          path: `${data.uri}.${data.type.split[1]}`,
          data: base64,
        };

        this.sendAudio(newData);

        // this.uploadFileApi(data);
      });
      //Printing the log realted to the file
      console.log('res : ' + JSON.stringify(res));
      console.log('URI : ' + res.uri);
      console.log('Type : ' + res.type);
      console.log('File Name : ' + res.name);
      console.log('File Size : ' + res.size);
      //Setting the state to show single file attributes
    } catch (err) {
      //Handling any exception (If any)
      if (DocumentPicker.isCancel(err)) {
        //If user canceled the document selection
        alert('Canceled from single doc picker');
      } else {
        //For Unknown Error

        throw err;
      }
    }
  };

  selectOneFile2 = () => {
    //Opening Document Picker for selection of one file
    try {
      const res = DocumentPicker.pick({
        type: [DocumentPicker.types.images],
      }).then((data) => {
        // console.log('asd', `data:base64,${data.uri}`);
      });
      //Printing the log realted to the file
      console.log('res : ' + JSON.stringify(res));
      console.log('URI : ' + res.uri);
      console.log('Type : ' + res.type);
      console.log('File Name : ' + res.name);
      console.log('File Size : ' + res.size);
      //Setting the state to show single file attributes
    } catch (err) {
      //Handling any exception (If any)
      if (DocumentPicker.isCancel(err)) {
        //If user canceled the document selection
        alert('Canceled from single doc picker');
      } else {
        //For Unknown Error

        throw err;
      }
    }
  };

  uploadImage = (datas) => {
    this.setState({open: false});
    var data = {
      user_id: this.state.userId,
      toid: this.props.navigation.state.params.userid,
      msg_type: 'image',
      reply_id: 0,
      body: 'sfsdfsdfd dsfsdfs',
      upload: [
        {
          fileName: datas.fileName,
          fileSize: datas.fileSize,
          height: datas.height,
          isVertical: datas.isVertical,
          originalRotation: datas.originalRotation,
          path: datas.path,
          type: datas.type,
          caption: 'hello',
          uri: '',
          width: datas.width,
          data: datas.data,
        },
      ],
    };

    axios('https://www.cartpedal.com/frontend/web/api-message/sent-message', {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
        device_id: '1234',
        device_token: '1111',
        device_type: 'android',
        Authorization: JSON.parse(this.state.userAccessToken),
      },
      data,
    })
      .then((responseData) => {
        if (responseData.data.code === 200) {
          // console.log('asda', responseData);
          // this.LoginOrNot();
          //   alert("Message sent succesfully")

          this.getConversationList();
        } else {
          // alert(responseData.data);

          console.log('logged user stories' + JSON.stringify(responseData));
        }
      })

      .catch((error) => {
        console.error(error);
      });
  };

  launchCamera = async () => {
    ImagePicker.launchCamera({mediaType: 'photo'}, async (response) => {
      // await this.inputRef.focus();
      await this.setState({open: false});
      const messageToSent = {
        ...newMessage,
        msg_type: 'image',
        fmsg: '',
        fattach: {...newMessage.fattach, attach: response.uri},
        time: new Date(),
      };
      this.setState((p) => ({
        chatList: {
          ...p.chatList,
          messages: [...p.chatList.messages, messageToSent],
        },
        ischatList: true,
      }));
      this.uploadImage(response);
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
      } else {
        const source = {uri: response.uri};

        // You can also display the image using data:
        // const source = { uri: 'data:image/jpeg;base64,' + response.data };

        this.setState({
          avatarSource: source,
        });
      }
    });
  };

  imagepicker = () => {
    ImagePicker.showImagePicker({mediaType: 'photo'}, async (response) => {
      //  await this.inputRef.focus();
      await this.setState({open: false});
      const messageToSent = {
        ...newMessage,
        msg_type: 'image',
        fmsg: '',
        fattach: {...newMessage.fattach, attach: response.uri},
        time: new Date(),
      };
      this.setState((p) => ({
        chatList: {
          ...p.chatList,
          messages: [...p.chatList.messages, messageToSent],
        },
        ischatList: true,
      }));
      this.uploadImage(response);
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
      } else {
        const source = {uri: response.uri};

        // You can also display the image using data:
        // const source = { uri: 'data:image/jpeg;base64,' + response.data };

        this.setState({
          avatarSource: source,
        });
      }
    });
  };

  videoPicker = async () => {
    ImagePicker.showImagePicker(
      {
        title: 'Select Video',
        takePhotoButtonTitle: 'Record Video',
        chooseFromLibraryButtonTitle: 'Choose From Gallery',
        mediaType: 'video',
      },
      (response) => {
        // this.uploadFileApi(response);

        console.log('Response = ', response);

        if (response.didCancel) {
          console.log('User cancelled image picker');
        } else if (response.error) {
          console.log('ImagePicker Error: ', response.error);
        } else if (response.customButton) {
          console.log('User tapped custom button: ', response.customButton);
        } else {
          this.props.navigation.navigate('VideoProcessScreen', {
            uri: response.path,
            sendVideo: this.sendVideo,
          });
          // You can also display the image using data:
          // const source = { uri: 'data:image/jpeg;base64,' + response.data };
        }
      },
    );
  };

  sendContact = (contact) => {
    this.setState({open: false});
    var raw = JSON.stringify({
      user_id: this.state.userId,
      toid: this.props.navigation.state.params.userid,
      msg_type: 'contact',
      body: JSON.stringify(contact),
      reply_id: '0',
      upload: [],
    });

    const messageToSent = {
      ...newMessage,
      msg_type: 'contact',
      fmsg: JSON.stringify(contact),
      time: new Date(),
    };
    this.setState((p) => ({
      chatList: {
        ...p.chatList,
        messages: [...p.chatList.messages, messageToSent],
      },
      ischatList: true,
    }));

    fetch('https://www.cartpedal.com/frontend/web/api-message/sent-message', {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
        device_id: '1234',
        device_token: this.state.fcmToken,
        device_type: 'android',
        Authorization: JSON.parse(this.state.userAccessToken),
      },
      body: raw,
    })
      .then((response) => response.json())
      .then((responseData) => {
        if (responseData.code === 200) {
          // console.log('asda', responseData);
          this.getConversationList();
        } else {
          console.log('logged user stories' + JSON.stringify(responseData));
        }
      })

      .catch((error) => {
        console.error(error);
      });
  };

  contactPicker = async () => {
    this.setState({open: false});
    PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
    ).then(() => {
      this.props.navigation.navigate('ContactsListScreen', {
        sendContact: this.sendContact,
      });
    });
  };

  sendAudio = (data) => {
    this.setState({open: false});
    const messageToSent = {
      ...newMessage,
      msg_type: 'audio',
      fmsg: '',
      fattach: {...newMessage.fattach, attach: data.path},
      time: new Date(),
    };
    this.setState((p) => ({
      chatList: {
        ...p.chatList,
        messages: [...p.chatList.messages, messageToSent],
      },
      ischatList: true,
    }));
    var data = {
      user_id: this.state.userId,
      toid: this.props.navigation.state.params.userid,
      msg_type: 'audio',
      reply_id: 0,
      body: '',
      upload: [
        {
          path: data.path,
          caption: '',
          data: data.data,
        },
      ],
    };

    fetch('https://www.cartpedal.com/frontend/web/api-message/sent-message', {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
        device_id: '1234',
        device_token: '1111',
        device_type: 'android',
        Authorization: JSON.parse(this.state.userAccessToken),
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((responseData) => {
        if (responseData.code === 200) {
          // console.log('asda', responseData);
          // this.LoginOrNot();
          //   alert("Message sent succesfully")

          this.getConversationList();
        } else {
          // alert(responseData.data);

          console.log('logged user stories' + JSON.stringify(responseData));
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  startRecording = async () => {
    await recordingPermissions();
    const result = await audioRecorderPlayer.startRecorder(
      DocumentDirectoryPath + '/sample.mp4',
    );
    audioRecorderPlayer.addRecordBackListener((e) => {
      return;
    });
  };

  onStopRecord = async () => {
    const result = await audioRecorderPlayer.stopRecorder();
    audioRecorderPlayer.removeRecordBackListener();
    const base64string = await readFile(result, 'base64');
    const data = {
      data: base64string,
      path: result,
    };
    this.sendAudio(data);
  };

  sendLocation = (location) => {
    const messageToSent = {
      ...newMessage,
      msg_type: 'location',
      fmsg: JSON.stringify(location),
      time: new Date(),
    };

    this.setState((p) => ({
      chatList: {
        ...p.chatList,
        messages: [...p.chatList.messages, messageToSent],
      },
      ischatList: true,
    }));

    var raw = JSON.stringify({
      user_id: this.state.userId,
      toid: this.props.navigation.state.params.userid,
      msg_type: 'location',
      body: JSON.stringify(location),
      reply_id: '0',
      upload: [],
    });

    fetch('https://www.cartpedal.com/frontend/web/api-message/sent-message', {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
        device_id: '1234',
        device_token: this.state.fcmToken,
        device_type: 'android',
        Authorization: JSON.parse(this.state.userAccessToken),
      },
      body: raw,
    })
      .then((response) => response.json())
      .then((responseData) => {
        if (responseData.code === 200) {
          // console.log('asda', responseData);
          this.getConversationList();
        } else {
          console.log('logged user stories' + JSON.stringify(responseData));
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  locationPicker = async () => {
    try {
      this.setState({open: false});
      await locationPermission();
      Geolocation.getCurrentPosition(
        (info) => {
          const location = {
            latitude: info.coords.latitude,
            longitude: info.coords.longitude,
          };
          this.sendLocation(location);
        },
        (err) => {
          alert(err.message);
        },
        {enableHighAccuracy: false, timeout: 20000, maximumAge: 10000},
      );
    } catch (error) {
      console.log(error, 'I am here ');
    }
  };

  onChangeText = (text) => {
    this.setState({message: text});
  };
  NotificationCallPhone=(type)=> {
    let formData = new FormData()
      formData.append('user_id', this.state.userId)
      formData.append('toid', this.props.navigation.state.params.userid)
      formData.append('calltype',type)
      formData.append('type',type)
      console.log('form data==' + JSON.stringify(formData))
    // var CartList = this.state.baseUrl + 'api-product/cart-list'
      var RecentShare = "https://www.cartpedal.com/frontend/web/api-user/call-notification"
      console.log('Add product Url:' + RecentShare)
      console.log('form data general tab',JSON.stringify(formData));
      fetch(RecentShare, {
        method: 'Post',
        headers: new Headers({
          'Content-Type': 'multipart/form-data',
          device_id: '1111',
          device_token: this.state.fcmToken,
          device_type: 'android',
          Authorization: JSON.parse(this.state.userAccessToken), 
        }),
        body: formData,
      })
        .then(response => response.json())
        .then(responseData => {
        // this.hideLoading();
          if (responseData.code == '200') {
            if(type==1){
          this.props.navigation.navigate('VideoCall',{useravatar:this.props.navigation.state.params.useravatar}) 
            }else{
              if(type==0)this.props.navigation.navigate('VoiceCall',{useravatar:this.props.navigation.state.params.useravatar})
            }
            console.log('call notification',JSON.stringify(responseData));
          } else {
            console.log('call notification',JSON.stringify(responseData));
          }
          console.log('response object:', responseData)
          console.log('User user ID==', JSON.stringify(responseData))
        })
        .catch(error => {;
          console.error(error)
        })
        .done()
      }

  deleteMessages = () => {
    const {fcmToken, userId, userAccessToken, forwardMessageIds} = this.state;

    const msgids = JSON.stringify(forwardMessageIds);

    const data = new FormData();

    data.append('user_id', userId);
    data.append('msgids', msgids.substring(1, msgids.length - 1));

    var EditProfileUrl =
      'https://www.cartpedal.com/frontend/web/api-message/delete-message';
    console.log('Add product Url:' + EditProfileUrl);
    fetch(EditProfileUrl, {
      method: 'POST',
      headers: {
        device_id: '1234',
        device_token: fcmToken,
        device_type: 'android',
        Authorization: JSON.parse(userAccessToken),
      },
      body: data,
    })
      .then((response) => response.json())
      .then((responseData) => {
        //   this.hideLoading();
        if (responseData.code == '200') {
          this.setState({
            selectedMode: false,
            forwardMessageIds: [],
          });
          //  Toast.show(responseData.message);
          this.getConversationList();
        } else {
          console.log(responseData.data);
        }

        //console.log('Edit profile response object:', responseData)
        console.log(
          'contact list response object:',
          JSON.stringify(responseData),
        );
        // console.log('access_token ', this.state.access_token)
        //   console.log('User Phone Number==' + formData.phone_number)
      })
      .catch((error) => {
        //  this.hideLoading();
        console.error(error);
      })
      .finally(() => {});
  };

  render() {
    return (
      <Container style={{backgroundColor: '#F1F0F2'}}>
        <View
          style={{
            width: '100%',
            height: '10%',
            backgroundColor: '#FFFFFF',
            zIndex: 2,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            flexDirection: 'row',
            alignItems: 'center',
          }}>
          <View
            style={{
              flexDirection: 'row',
              width: '100%',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            <View style={styles.BackButtonContainer}>
              <TouchableOpacity onPress={() => this.props.navigation.goBack()}>
                <Image
                  source={require('../images/back_blck_icon.png')}
                  style={styles.backButtonStyle}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.TitleContainer}>
              <ImageModal
                imageBackgroundColor="transparent"
                source={
                  this.props.navigation.state.params.useravatar
                    ? {uri: this.props.navigation.state.params.useravatar}
                    : require('../images/default_user.png')
                }
                style={styles.LogoIconStyle}
              />
              {/* <Image
                source={
                  this.props.navigation.state.params.useravatar
                    ? {uri: this.props.navigation.state.params.useravatar}
                    : require('../images/default_user.png')
                }
                style={styles.LogoIconStyle}
              /> */}
              <TouchableOpacity
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingLeft: 8,
                }}>
                <Text
                  style={[styles.TitleStyle, {width: 150, textAlign: 'left'}]}>
                  {this.props.navigation.state.params.username}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              {this.state.selectedMode ? (
                <>
                  <Icon
                    name="delete"
                    type="MaterialCommunityIcons"
                    onPress={() => {
                      this.deleteMessages();
                    }}
                    style={{color: '#2B2B2B', fontSize: 18, marginRight: 15}}
                  />
                  <Icon
                    name="content-copy"
                    type="MaterialCommunityIcons"
                    onPress={() => {
                      this.copyToClipboard();
                    }}
                    style={{color: '#2B2B2B', fontSize: 18, marginRight: 15}}
                  />
                  <Icon
                    name="forward"
                    type="Entypo"
                    onPress={() => {
                      const msgids = JSON.stringify(
                        this.state.forwardMessageIds,
                      );
                      this.setState({
                        selectedMode: false,
                        forwardMessageIds: [],
                      });
                      this.props.navigation.navigate('ForwardMessageScreen', {
                        fcmToken: this.state.fcmToken,
                        PhoneNumber: this.state.PhoneNumber,
                        userId: this.state.userId,
                        userAccessToken: this.state.userAccessToken,
                        msgids: msgids.substring(1, msgids.length - 1),
                      });
                    }}
                    style={{
                      color: '#2B2B2B',
                      fontSize: 18,
                      marginHorizontal: 10,
                      marginRight: 15,
                    }}
                  />
                </>
              ) : (
                <>
                  <Icon
                    name="video"
                    onPress={() => {
                      this.NotificationCallPhone(1);
                    }}
                    type="Feather"
                    style={{color: '#2B2B2B', fontSize: 18, marginRight: 15}}
                  />
                  <Icon
                    name="phone"
                    type="Feather"
                    onPress={() => {
                      this.NotificationCallPhone(0);
                    }}
                    style={{
                      color: '#2B2B2B',
                      fontSize: 18,
                      marginHorizontal: 10,
                      marginRight: 15,
                    }}
                  />
                  {/* <Icon
                name="more-vertical"
                type="Feather"
                style={{color: '#2B2B2B', fontSize: 24, marginRight: 5}}
              /> */}
                  <Menu
                    ref={(ref) => (this._menu = ref)}
                    button={
                      <TouchableOpacity
                        onPress={() => {
                          //  this._menu.show()
                        }}>
                        <Icon
                          name="more-vertical"
                          type="Feather"
                          style={{
                            color: '#2B2B2B',
                            fontSize: 24,
                            marginRight: 5,
                          }}
                        />
                      </TouchableOpacity>
                    }>
                    <MenuItem onPress={() => this._menu.hide()}>
                      Option 1
                    </MenuItem>
                    <MenuItem onPress={() => this._menu.hide()}>
                      Option 2
                    </MenuItem>
                    <MenuItem onPress={() => this._menu.hide()}>
                      Option 3
                    </MenuItem>
                    <MenuItem onPress={() => this._menu.hide()}>
                      Option 4
                    </MenuItem>
                  </Menu>
                </>
              )}
            </View>
          </View>
        </View>
        <ScrollView
          style={{height: height * 0.84}}
          ref={(ref) => {
            this.scrollView = ref;
          }}
          onContentSizeChange={() =>
            this.scrollView.scrollToEnd({animated: true})
          }>
          <ScrollView>
            <View style={{paddingHorizontal: 10, marginTop: '20%'}}>
              <Text
                style={{
                  color: 'red',
                  fontSize: 14,
                  textAlign: 'center',
                  marginTop: 10,
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                }}>
                10 july , friday
              </Text>
              {this.state.ischatList
                ? this.state.chatList.messages.map((v, i) => {
                    return (
                      <MessageComponent
                        key={`message-${i}`}
                        message={v}
                        toggleSelectedMode={this.toggleSelectedMode}
                        appendMessages={this.appendMessages}
                        removeMessages={this.removeMessages}
                        selectedMode={this.state.selectedMode}
                        forwardMessageIds={this.state.forwardMessageIds}
                        copyText={this.copyText}
                      />
                    );
                  })
                : null}
            </View>
          </ScrollView>
        </ScrollView>

        {this.state.open && (
          <View
            style={{
              width: '90%',
              height: '35%',
              backgroundColor: '#FFFFFF',
              alignSelf: 'center',
              borderRadius: 10,
              justifyContent: 'space-around',
              padding: 20,
            }}>
            <View
              style={{flexDirection: 'row', justifyContent: 'space-around'}}>
              <View>
                <TouchableOpacity
                  style={{justifyContent: 'center', alignItems: 'center'}}
                  onPress={() => this.selectOneFile()}>
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: '#ffebe6',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                    <Image
                      source={require('../images/docs.png')}
                      resizeMode="center"
                      style={{alignSelf: 'center'}}
                    />
                  </View>
                  <Text
                    style={{
                      fontSize: 12,
                      color: '#2B2B2B',
                      textAlign: 'center',
                    }}>
                    Document
                  </Text>
                </TouchableOpacity>
              </View>
              <View>
                <TouchableOpacity onPress={() => this.videoPicker()}>
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: '#e7f0fe',
                      justifyContent: 'center',
                    }}>
                    <Icon
                      name="videocam"
                      type="Ionicons"
                      style={{
                        fontSize: 18,
                        alignSelf: 'center',
                        color: '#4086F4',
                      }}
                    />
                  </View>
                  <Text
                    style={{
                      fontSize: 12,
                      color: '#2B2B2B',
                      textAlign: 'center',
                    }}>
                    Video
                  </Text>
                </TouchableOpacity>
              </View>
              <View>
                <TouchableOpacity onPress={() => this.imagepicker()}>
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: '#e6fef6',
                      justifyContent: 'center',
                    }}>
                    <Image
                      source={require('../images/gal.png')}
                      resizeMode="center"
                      style={{alignSelf: 'center'}}
                    />
                  </View>
                  <Text
                    style={{
                      fontSize: 12,
                      color: '#2B2B2B',
                      textAlign: 'center',
                    }}>
                    Photo
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View
              style={{flexDirection: 'row', justifyContent: 'space-around'}}>
              <View style={{marginLeft: 10}}>
                <TouchableOpacity onPress={() => this.selectOneFile1()}>
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: '#fffae6',
                      justifyContent: 'center',
                    }}>
                    <Image
                      source={require('../images/audioo.png')}
                      resizeMode="center"
                      style={{alignSelf: 'center'}}
                    />
                  </View>
                  <Text
                    style={{
                      fontSize: 12,
                      color: '#2B2B2B',
                      textAlign: 'center',
                    }}>
                    Audio
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={{justifyContent: 'center', alignItems: 'center'}}>
                <TouchableOpacity
                  onPress={() => this.locationPicker()}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: '#e6fef6',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Image
                    source={require('../images/loc.png')}
                    resizeMode="center"
                    style={{alignSelf: 'center'}}
                  />
                </TouchableOpacity>
                <Text
                  style={{fontSize: 12, color: '#2B2B2B', textAlign: 'center'}}>
                  Location
                </Text>
              </View>
              <View>
                <TouchableOpacity onPress={() => this.contactPicker()}>
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: '#e7f0fe',
                      justifyContent: 'center',
                    }}>
                    <Image
                      source={require('../images/folw.png')}
                      resizeMode="center"
                      style={{alignSelf: 'center'}}
                    />
                  </View>
                  <Text style={{fontSize: 12, color: '#2B2B2B'}}>Contact</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
        <View
          style={{
            flexDirection: 'row',
            marginBottom:
              this.state.chatList.length === 0
                ? height * 0.001
                : height * 0.001,
            alignSelf: 'center',
          }}>
          <TextInput
            ref={(ref) => (this.inputRef = ref)}
            multiline={true}
            value={this.state.message}
            onContentSizeChange={(event) => {
              this.setState({height: event.nativeEvent.contentSize.height});
            }}
            onChangeText={(text) => this.onChangeText(text)}
            placeholder="Type a message…"
            style={{
              margin: 10,
              backgroundColor: '#FFFFFF',
              color: '#0000008A',
              borderRadius: 35,
              width: '60%',
              height: this.state.height,
              fontSize: 12,
              paddingLeft: 10,
              borderWidth: 0,
              borderTopRightRadius: 0,
              borderBottomRightRadius: 0,
            }}
          />
          <View
            style={{
              backgroundColor: '#FFFFFF',
              alignSelf: 'center',
              height: this.state.height,
              width: '20%',
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 0,
              marginLeft: -10,
              borderTopRightRadius: 35,
              borderBottomRightRadius: 35,
              paddingBottom: 4,
              marginBottom: 2,
            }}>
            <View style={{flexDirection: 'row'}}>
              <Icon
                onPress={() => {
                  this.setState({open: !this.state.open});
                }}
                name="attachment"
                type="MaterialIcons"
                style={{color: '#0000008A', marginRight: 8}}
              />
              <Icon
                onPress={() => {
                  this.launchCamera();
                }}
                name="photo-camera"
                type="MaterialIcons"
                style={{color: '#0000008A', marginRight: 8}}
              />
            </View>
          </View>
          <View
            style={{
              alignSelf: 'flex-end',
              width: this.state.recording ? 60 : 40,
              height: this.state.recording ? 60 : 40,
              margin: this.state.recording ? 0 : 10,
              borderRadius: this.state.recording ? 30 : 20,
              backgroundColor: 'red',
              justifyContent: 'center',
            }}>
            <TouchableOpacity
              onLongPress={() => {
                this.startRecording();
                this.setState({recording: true});
              }}
              onPressOut={() => {
                this.onStopRecord();
                this.setState({recording: false});
              }}
              onPress={() => {
                this.sendMessage();
              }}>
              {this.state.message === '' ? (
                <Icon
                  name="mic"
                  type="Feather"
                  style={{
                    color: '#FFFFFF',
                    fontSize: 18,
                    alignSelf: 'center',
                  }}
                />
              ) : (
                <Icon
                  name="arrowright"
                  type="AntDesign"
                  style={{fontSize: 20, color: '#FFFFFF', alignSelf: 'center'}}
                />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Container>
    );
  }
}
const styles = StyleSheet.create({
  headerView: {
    flex: 0.1,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    elevation: 20,
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
  TitleContainer: {
    flexDirection: 'row',
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  LogoIconStyle: {
    margin: 5,
    height: 30,
    width: 30,
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
  SearchIconStyle: {
    margin: 5,
    marginRight: 20,
    height: 25,
    width: 25,
    alignSelf: 'flex-end',
  },
  TabBox: {
    flex: 0.1,
    color: '#000',
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
  StyleHomeTab: {
    marginTop: 5,
    width: 30,
    height: 28,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomActiveTextStyle: {
    color: '#FB3954',
    fontSize: resp(10),
    marginTop: 5,
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
  StyleSettingTab: {
    marginTop: 9,
    width: 30,
    height: 30,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
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
  StyleChatTab: {
    marginTop: 9,
    width: 30,
    height: 30,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
export default ChatDetailScreen;

const newMessage = {
  fattach: null,
  fmsg: '',
  id: 42,
  isread: '0',
  msg_type: '',
  reply_id: 0,
  tattach: '',
  time: new Date(),
  tmsg: '',
  type: '0',
  sending: true,
};