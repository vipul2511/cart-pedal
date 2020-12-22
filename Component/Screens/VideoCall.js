import React, { Component } from 'react';
import { View, NativeModules,Image, Text,BackHandler, ToastAndroid,Dimensions } from 'react-native';
import { RtcEngine, AgoraView } from 'react-native-agora';
import Icon from 'react-native-vector-icons/MaterialIcons';
import styles from './Styles';
import AsyncStorage from '@react-native-community/async-storage';
// import {API_KEY} from 'react-native-dotenv';
let dimensions = {                                //get dimensions of the device to use in view styles
  width: Dimensions.get('window').width,
  height: Dimensions.get('window').height,
};
const { Agora } = NativeModules;            //Define Agora object as a native module

const {
  FPS30,
  AudioProfileDefault,
  AudioScenarioDefault,
  Adaptative,
} = Agora;                                  //Set defaults for Stream

const config = {                            //Setting config of the app
  appid: '0f8cb6d4df7f4f548daaf17f5f896413',               //Enter the App ID generated from the Agora Website
  channelProfile: 0,//Set channel profile as 0 for RTC
  videoEncoderConfig: {                     //Set Video feed encoder settings
    width: 720,                        
    height: 1080,
    bitrate: 1,
    frameRate: FPS30,
    orientationMode: Adaptative,
  },
  audioProfile: AudioProfileDefault,
  audioScenario: AudioScenarioDefault,
};
RtcEngine.init(config); 

class VideoCall extends Component {
  constructor(props) {
    super(props);
    this.state = {
      peerIds: [],                                       //Array for storing connected peers
      uid: Math.floor(Math.random() * 100),              //Generate a UID for local user
      appid: config.appid,
      channelName:'123456',  
      Password:'',                      //Channel Name for the current session
      joinSucceed: false,   
      vidMute: false,                             //State variable for Video Mute
      audMute: false,   
      color:false,                           //State variable for storing success
    };
  
  }
  componentDidMount =async()=> {
    // const datas= await AsyncStorage.getItem('channelName');
    // const finalDatas= JSON.parse(datas);
    // console.log(finalDatas.channelName);
    // this.setState({channelName:finalDatas.channelName});
    console.log('Video working0');
    RtcEngine.on('userJoined', (data) => {
      const { peerIds } = this.state;                   //Get currrent peer IDs
      if (peerIds.indexOf(data.uid) === -1) {           //If new user has joined
        this.setState({
          peerIds: [...peerIds, data.uid],              //add peer ID to state array
        });
      }
    });
    RtcEngine.on('userOffline', (data) => {             //If user leaves
      this.setState({
        peerIds: this.state.peerIds.filter(uid => uid !== data.uid), //remove peer ID from state array
      });
    });
    RtcEngine.on('joinChannelSuccess', (data) => {                   //If Local user joins RTC channel
      RtcEngine.startPreview();                                      //Start RTC preview
      this.setState({
        joinSucceed: true,                                           //Set state variable to true
      });
    });
     //Initialize the RTC engine
    RtcEngine.joinChannel(this.state.channelName, this.state.uid);  //Join Channel
    RtcEngine.enableAudio();
  }

  /**
  * @name startCall
  * @description Function to start the call
  */
  
  /**
  * @name endCall
  * @description Function to end the call
  */
  endCall = () => {
    this.setState({color:true});
    RtcEngine.leaveChannel();
    this.setState({
      peerIds: [],
      joinSucceed: false,
    },()=>{
      this.props.navigation.goBack();
    });

  }
  toggleAudio() {
    let mute = this.state.audMute;
    console.log('Audio toggle', mute);
    RtcEngine.muteLocalAudioStream(!mute);
    this.setState({
      audMute: !mute,
    });
  }
  toggleVideo() {
    let mute = this.state.vidMute;
    console.log('Video toggle', mute);
    this.setState({
      vidMute: !mute,
    });
    RtcEngine.muteLocalVideoStream(!this.state.vidMute);
  }
  
  /**
  * @name videoView
  * @description Function to return the view for the app
  */
  videoView() {
    return (
      <View style={styles.max}>
        {
          <View style={styles.max}>
            
            {
              !this.state.joinSucceed ?
                <View />
                :
                <View style={styles.fullView}>
                   {/* {this.state.peerIds.length>0?(<View>
                  <AgoraView style={styles.localVideoStyle,{width:120,height:120}}
                    zOrderMediaOverlay={true} showLocalVideo={true} mode={1} />
                    </View>):(<View>
                  <AgoraView style={styles.localVideoStyle,{width:dimensions.width,height:dimensions.height-70}}
                    zOrderMediaOverlay={true} showLocalVideo={true} mode={1} />
                    </View>)} */}
                  {
                    
                    // this.state.peerIds.length > 3                   //view for four videostreams
                    //   ? <View style={styles.full}>
                    //     <View style={styles.halfViewRow}>
                    //       <AgoraView style={styles.half}
                    //         remoteUid={this.state.peerIds[0]} mode={1} />
                    //       <AgoraView style={styles.half}
                    //         remoteUid={this.state.peerIds[1]} mode={1} />
                    //     </View>
                    //     <View style={styles.halfViewRow}>
                    //       <AgoraView style={styles.half}
                    //         remoteUid={this.state.peerIds[2]} mode={1} />
                    //       <AgoraView style={styles.half}
                    //         remoteUid={this.state.peerIds[3]} mode={1} />
                    //     </View>
                    //   </View>
                    //   : this.state.peerIds.length > 2                   //view for three videostreams
                    //     ? <View style={styles.full}>
                    //       <View style={styles.half}>
                    //         <AgoraView style={styles.full}
                    //           remoteUid={this.state.peerIds[0]} mode={1} />
                    //       </View>
                    //       <View style={styles.halfViewRow}>
                    //         <AgoraView style={styles.half}
                    //           remoteUid={this.state.peerIds[1]} mode={1} />
                    //         <AgoraView style={styles.half}
                    //           remoteUid={this.state.peerIds[2]} mode={1} />
                    //       </View>
                    //     </View> :
                        // this.state.peerIds.length > 1                   //view for two videostreams
                        //   ? <View style={styles.full}>
                        //     <AgoraView style={styles.full}
                        //       remoteUid={this.state.peerIds[0]} mode={1} />
                        //     <AgoraView style={styles.full}
                        //       remoteUid={this.state.peerIds[1]} mode={1} />
                        //   </View>:
                           this.state.peerIds.length > 0                   //view for videostream
                            ?
                            <View style={styles.full}>
                             <AgoraView style={styles.full}
                              remoteUid={this.state.peerIds[0]} mode={1} />
                              </View>
                            : <View style={{flex:1,backgroundColor:'black',justifyContent:'center',alignItems:'center'}}>
                            <Image source={ this.props.navigation.state.params.useravatar
                              ? {uri: this.props.navigation.state.params.useravatar}
                              : require('../images/default_user.png')} style={{width:220,height:220}}  ></Image>
                          </View>
                  }
                    <AgoraView style={[styles.localVideoStyle,{width:120,height:180}]}
                    zOrderMediaOverlay={true} showLocalVideo={true} mode={1} />
                 {/* <AgoraView style={[styles.localVideoStyle,{width:this.state.peerIds.length > 0?dimensions.width:120,height:this.state.peerIds.length > 0?dimensions.height-70:180}]}
                    zOrderMediaOverlay={true} showLocalVideo={true} mode={1} /> */}
                </View>
            }
          </View>
        }
        <View style={styles.buttonBar}>
          <Icon.Button style={styles.iconStyle}
            backgroundColor="#0093E9"
            name={this.state.audMute ? 'mic-off' : 'mic'}
            onPress={() => this.toggleAudio()}
          />
          <Icon.Button style={styles.iconStyle}
            backgroundColor="#0093E9"
            name="call-end"
            color={this.state.color ?'red':'white'}
            onPress={() => this.endCall()}
          />
          <Icon.Button style={styles.iconStyle}
            backgroundColor="#0093E9"
            name={this.state.vidMute ? 'videocam-off' : 'videocam'}
            onPress={() => this.toggleVideo()}
          />
         
        </View>
      </View>
    );
  }
  render() {
    return this.videoView();
  }
}
export default VideoCall;