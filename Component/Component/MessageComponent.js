import React, {useEffect, useMemo, useState} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import moment from 'moment';
import Lightbox from 'react-native-lightbox';
import VideoPlayer from 'react-native-video-player';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import {Icon} from 'native-base';
import Slider from 'react-native-slider';
import {downloadFile, DocumentDirectoryPath} from 'react-native-fs';
import FileViewer from 'react-native-file-viewer';
import MapView, {PROVIDER_GOOGLE, Marker} from 'react-native-maps';

import ImageLoad from './ImageLoad';

const audioRecorderPlayer = new AudioRecorderPlayer();

const initialize = (sending) => {
  if (sending) {
    return true;
  } else {
    return false;
  }
};

export const MessageComponent = ({
  message,
  selectedMode,
  forwardMessageIds,
  toggleSelectedMode,
  appendMessages,
  removeMessages,
  copyText,
}) => {
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(initialize(message.sending));
  const [audio, setAudio] = useState({playing: false, duration: 0, current: 0});

  const [opacity, setOpacity] = useState(0);

  const onLoadStart = () => {
    setOpacity(1);
  };

  const onLoad = () => {
    setOpacity(0);
  };

  const onBuffer = ({isBuffering}) => {
    setOpacity(isBuffering ? 1 : 0);
  };

  const onStartPlay = async (uri) => {
    await audioRecorderPlayer.startPlayer(uri);
    setAudio({...audio, playing: true});

    audioRecorderPlayer.addPlayBackListener(async (e) => {
      setAudio((p) => ({
        playing: p.playing,
        current: e.current_position,
        duration: e.duration,
      }));
      if (e.current_position === e.duration) {
        setAudio((p) => ({
          duration: p.duration,
          current: p.current,
          playing: false,
        }));
        await audioRecorderPlayer.stopPlayer();
        await audioRecorderPlayer.removePlayBackListener();
      }
      return;
    });
  };

  const onPausePlay = async () => {
    await audioRecorderPlayer.pausePlayer();
    setAudio((p) => ({
      current: p.current,
      duration: p.duration,
      playing: false,
    }));
  };

  const downloadAndOpenDocument = async (uri) => {
    const parts = uri.split('/');
    const fileName = parts[parts.length - 1];
    downloadFile({
      fromUrl: uri,
      toFile: `${DocumentDirectoryPath}/${fileName}`,
    }).promise.then((res) => {
      FileViewer.open(`${DocumentDirectoryPath}/${fileName}`, {
        showOpenWithDialog: true,
      });
    });
  };

  useEffect(() => {
    return async () => {
      await audioRecorderPlayer.stopPlayer();
      await audioRecorderPlayer.removePlayBackListener();
    };
  }, []);

  useEffect(() => {
    if (message.sending) {
      setOpacity(1);
      setSending(true);
    } else {
      setOpacity(0);
      setSending(false);
    }
  }, [message]);

  // const onStopPlay = async () => {
  //   this.audioRecorderPlayer.stopPlayer();
  //   this.audioRecorderPlayer.removePlayBackListener();
  //   setAudio({...audio, playing: false});
  // };

  let content = null;

  // console.log(message);

  const {msg_type, fattach} = message;

  if (msg_type === 'text') {
    if (message.tmsg !== '') {
      content = (
        <View
          style={{
            alignSelf: 'flex-start',
            marginVertical: 10,
          }}>
          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 8,
              elevation: 5,
              width: '70%',
            }}>
            <Text
              style={{
                margin: 10,
                color: '#2B2B2B',
                fontSize: 12,
              }}>
              {message.tmsg}
            </Text>
          </View>
          <Text
            style={{
              color: '#524D4D',
              fontSize: 10,
              marginRight: 10,
              marginTop: 5,
              alignSelf: 'flex-start',
            }}>
            {moment(message.time).format('hh:mm')}
          </Text>
        </View>
      );
    }
    if (message.fmsg !== '') {
      content = (
        <View style={{alignSelf: 'flex-end', marginVertical: 10}}>
          <View
            style={{
              backgroundColor: 'red',
              borderRadius: 8,
              elevation: 5,
              width: '70%',
            }}>
            <Text
              style={{
                margin: 10,
                color: '#fff',
                fontSize: 12,
              }}>
              {message.fmsg}
            </Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: 5,
            }}>
            <Text
              style={{
                color: '#524D4D',
                fontSize: 10,
                paddingLeft: 8,
              }}>
              {moment(message.time).format('hh:mm')}
            </Text>
            {sending ? (
              <Icon
                type="MaterialCommunityIcons"
                name="clock-time-nine"
                style={{
                  fontSize: 18,
                  color: 'red',
                }}
              />
            ) : (
              <Icon
                type="Ionicons"
                name="checkmark-done-sharp"
                style={{
                  fontSize: 16,
                  color: message.is_read === '1' ? '#34B7F1' : 'grey',
                }}
              />
            )}
          </View>
        </View>
      );
    }
  }

  if (msg_type === 'contact') {
    if (message.tmsg !== '') {
      const contact = JSON.parse(JSON.parse(message.tmsg));
      content = (
        <View
          style={{
            alignSelf: 'flex-start',
            marginVertical: 10,
          }}>
          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 8,
              elevation: 5,
              width: '80%',
              flexDirection: 'row',
              alignItems: 'center',
              padding: 10,
            }}>
            <Image
              source={
                contact.hasThumbnail
                  ? {uri: contact.thumbnailPath}
                  : require('../images/default_user.png')
              }
              style={styles.Styleimage}
            />
            <View style={{paddingHorizontal: 16, alignSelf: 'flex-start'}}>
              <Text
                style={{
                  color: '#2B2B2B',
                  fontSize: 16,
                }}>
                {contact.displayName}
              </Text>
              {contact.phoneNumbers &&
                contact.phoneNumbers.map((i) => (
                  <Text
                    style={{
                      color: '#2B2B2B',
                      fontSize: 12,
                    }}>
                    {i.number}
                  </Text>
                ))}
            </View>
          </View>
          <Text
            style={{
              color: '#524D4D',
              fontSize: 10,
              marginRight: 10,
              marginTop: 5,
              alignSelf: 'flex-start',
            }}>
            {moment(message.time).format('hh:mm')}
          </Text>
        </View>
      );
    }
    if (message.fmsg !== '') {
      let contact = null;
      if (sending) {
        contact = JSON.parse(message.fmsg);
      } else {
        contact = JSON.parse(JSON.parse(message.fmsg));
      }

      content = (
        <View style={{alignSelf: 'flex-end', marginVertical: 10}}>
          <View
            style={{
              backgroundColor: 'red',
              borderRadius: 8,
              elevation: 5,
              width: '80%',
              flexDirection: 'row',
              alignItems: 'center',
              padding: 10,
            }}>
            <Image
              source={
                contact.hasThumbnail
                  ? {uri: contact.thumbnailPath}
                  : require('../images/default_user.png')
              }
              style={styles.Styleimage}
            />
            <View style={{paddingHorizontal: 16, alignSelf: 'flex-start'}}>
              <Text
                style={{
                  color: '#fff',
                  fontSize: 16,
                }}>
                {contact.displayName}
              </Text>
              {contact.phoneNumbers &&
                contact.phoneNumbers.map((i) => (
                  <Text
                    style={{
                      color: '#fff',
                      fontSize: 12,
                    }}>
                    {i.number}
                  </Text>
                ))}
            </View>
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: 5,
            }}>
            <Text
              style={{
                color: '#524D4D',
                fontSize: 10,
                paddingLeft: 8,
              }}>
              {moment(message.time).format('hh:mm')}
            </Text>
            {sending ? (
              <Icon
                type="MaterialCommunityIcons"
                name="clock-time-nine"
                style={{
                  fontSize: 18,
                  color: 'red',
                }}
              />
            ) : (
              <Icon
                type="Ionicons"
                name="checkmark-done-sharp"
                style={{
                  fontSize: 16,
                  color: message.is_read === '1' ? '#34B7F1' : 'grey',
                }}
              />
            )}
          </View>
        </View>
      );
    }
  }

  if (msg_type === 'image') {
    if (message.tattach !== null && message.tattach !== '') {
      content = (
        <View style={{alignSelf: 'flex-start', marginVertical: 10}}>
          <View
            style={{
              borderRadius: 8,
              elevation: 5,
              width: '70%',
            }}
          />
          <Lightbox>
            <ImageLoad
              style={{
                height: 200,
                width: 200,
                alignSelf: 'center',
              }}
              loadingStyle={{size: 'large', color: 'gray'}}
              source={{uri: message.tattach.attach}}
            />
          </Lightbox>
          <Text
            style={{
              color: '#524D4D',
              fontSize: 10,
              marginLeft: 10,
              marginTop: 5,
              alignSelf: 'flex-start',
            }}>
            {moment(message.time).format('hh:mm')}
          </Text>
        </View>
      );
    }
    if (message.fattach !== null && message.fattach !== '') {
      content = (
        <View style={{alignSelf: 'flex-end', marginVertical: 10}}>
          <View
            style={{
              borderRadius: 8,
              elevation: 5,
              width: '70%',
            }}
          />
          <Lightbox>
            <ImageLoad
              loading={sending}
              style={{
                height: 200,
                width: 200,
                alignSelf: 'center',
              }}
              loadingStyle={{size: 'large', color: 'gray'}}
              source={{uri: message.fattach.attach}}
            />
          </Lightbox>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: 5,
            }}>
            <Text
              style={{
                color: '#524D4D',
                fontSize: 10,
                paddingLeft: 8,
              }}>
              {moment(message.time).format('hh:mm')}
            </Text>
            {sending ? (
              <Icon
                type="MaterialCommunityIcons"
                name="clock-time-nine"
                style={{
                  fontSize: 18,
                  color: 'red',
                }}
              />
            ) : (
              <Icon
                type="Ionicons"
                name="checkmark-done-sharp"
                style={{
                  fontSize: 16,
                  color: message.is_read === '1' ? '#34B7F1' : 'grey',
                }}
              />
            )}
          </View>
        </View>
      );
    }
  }

  if (msg_type === 'video') {
    if (message.tattach !== null && message.tattach !== '') {
      content = (
        <View style={{alignSelf: 'flex-start', marginVertical: 10}}>
          <View
            style={{
              borderRadius: 8,
              elevation: 5,
              width: '70%',
            }}
          />

          <View>
            <VideoPlayer
              video={{uri: message.fattach.attach}}
              videoHeight={800}
              videoWidth={800}
              resizeMode="cover"
              onBuffer={onBuffer}
              onLoadStart={onLoadStart}
              onLoad={onLoad}
              disableControlsAutoHide={true}
            />
            <ActivityIndicator
              animating
              size="large"
              color={'red'}
              style={[
                {
                  zIndex: -5,
                  position: 'absolute',
                  top: 70,
                  left: 70,
                  right: 70,
                  height: 50,
                },
                {opacity},
              ]}
            />
          </View>

          <Text
            style={{
              color: '#524D4D',
              fontSize: 10,
              marginLeft: 10,
              marginTop: 5,
              alignSelf: 'flex-start',
            }}>
            {moment(message.time).format('hh:mm')}
          </Text>
        </View>
      );
    }
    if (message.fattach !== null && message.fattach !== '') {
      content = (
        <View style={{alignSelf: 'flex-end', marginVertical: 10}}>
          <View
            style={{
              borderRadius: 8,
              elevation: 5,
              width: '70%',
            }}
          />
          <View>
            <VideoPlayer
              video={{uri: message.fattach.attach}}
              videoHeight={800}
              videoWidth={800}
              resizeMode="cover"
              onBuffer={onBuffer}
              onLoadStart={onLoadStart}
              onLoad={onLoad}
              disableControlsAutoHide={true}
            />
            <ActivityIndicator
              animating
              size="large"
              color={'red'}
              style={[
                {
                  zIndex: sending ? 10 : -5,
                  position: 'absolute',
                  top: 70,
                  left: 70,
                  right: 70,
                  height: 50,
                },
                {opacity},
              ]}
            />
          </View>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: 5,
            }}>
            <Text
              style={{
                color: '#524D4D',
                fontSize: 10,
                paddingLeft: 8,
              }}>
              {moment(message.time).format('hh:mm')}
            </Text>
            {sending ? (
              <Icon
                type="MaterialCommunityIcons"
                name="clock-time-nine"
                style={{
                  fontSize: 18,
                  color: 'red',
                }}
              />
            ) : (
              <Icon
                type="Ionicons"
                name="checkmark-done-sharp"
                style={{
                  fontSize: 16,
                  color: message.is_read === '1' ? '#34B7F1' : 'grey',
                }}
              />
            )}
          </View>
        </View>
      );
    }
  }

  if (msg_type === 'audio') {
    if (message.tattach !== null && message.tattach !== '') {
      content = (
        <View
          style={{
            alignSelf: 'flex-start',
            marginVertical: 10,
          }}>
          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 8,
              elevation: 5,
              width: '80%',
              flexDirection: 'row',
              alignItems: 'center',
              padding: 10,
            }}>
            <Icon
              onPress={() => {
                if (audio.playing) {
                  onPausePlay();
                } else {
                  onStartPlay(message.tattach.attach);
                }
              }}
              name={audio.playing ? 'pause' : 'play'}
              style={{color: 'grey'}}
            />
            <View
              style={{
                paddingHorizontal: 16,
                width: '70%',
                alignSelf: 'flex-start',
              }}>
              <Slider
                disabled
                value={
                  audio.duration === 0 ? 0 : audio.current / audio.duration
                }
                thumbStyle={{width: 10, height: 10}}
              />
            </View>
          </View>
          <Text
            style={{
              color: '#524D4D',
              fontSize: 10,
              marginRight: 10,
              marginTop: 5,
              alignSelf: 'flex-start',
            }}>
            {moment(message.time).format('hh:mm')}
          </Text>
        </View>
      );
    }
    if (message.fattach !== null && message.fattach !== '') {
      content = (
        <View style={{alignSelf: 'flex-end', marginVertical: 10}}>
          <View
            style={{
              backgroundColor: 'red',
              borderRadius: 8,
              elevation: 5,
              width: '80%',
              flexDirection: 'row',
              alignItems: 'center',
              padding: 10,
            }}>
            {sending ? (
              <ActivityIndicator animating size="large" color={'white'} />
            ) : (
              <Icon
                onPress={() => {
                  if (audio.playing) {
                    onPausePlay();
                  } else {
                    onStartPlay(message.fattach.attach);
                  }
                }}
                name={audio.playing ? 'pause' : 'play'}
                style={{color: 'white'}}
              />
            )}

            <View
              style={{
                paddingHorizontal: 16,
                width: '70%',
                alignSelf: 'flex-start',
              }}>
              <Slider
                disabled
                value={
                  audio.duration === 0 ? 0 : audio.current / audio.duration
                }
                minimumTrackTintColor="white"
                thumbStyle={{width: 10, height: 10, backgroundColor: 'white'}}
                onValueChange={(value) => this.setState({value})}
              />
              <Text style={{fontSize: 12, color: 'white', marginTop: -12}}>
                {audioRecorderPlayer.mmssss(audio.current).slice(0, -3)}
              </Text>
            </View>
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: 5,
            }}>
            <Text
              style={{
                color: '#524D4D',
                fontSize: 10,
                paddingLeft: 8,
              }}>
              {moment(message.time).format('hh:mm')}
            </Text>
            {sending ? (
              <Icon
                type="MaterialCommunityIcons"
                name="clock-time-nine"
                style={{
                  fontSize: 18,
                  color: 'red',
                }}
              />
            ) : (
              <Icon
                type="Ionicons"
                name="checkmark-done-sharp"
                style={{
                  fontSize: 16,
                  color: message.is_read === '1' ? '#34B7F1' : 'grey',
                }}
              />
            )}
          </View>
        </View>
      );
    }
  }

  if (msg_type === 'file') {
    if (message.tattach !== null && message.tattach !== '') {
      content = (
        <View
          style={{
            alignSelf: 'flex-start',
            marginVertical: 10,
          }}>
          <TouchableOpacity
            onPress={() => {
              downloadAndOpenDocument(message.tattach.attach);
            }}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 8,
              elevation: 5,
              width: '80%',
              flexDirection: 'row',
              alignItems: 'center',
              padding: 10,
            }}>
            <Icon name="document" style={{color: '#2B2B2B'}} />
            <View
              style={{
                paddingHorizontal: 16,
                width: '70%',
                alignSelf: 'flex-start',
              }}>
              <Text style={{color: '#2B2B2B'}}>
                {
                  message.tattach.attach.split('/')[
                    message.tattach.attach.split('/').length - 1
                  ]
                }
              </Text>
            </View>
          </TouchableOpacity>
          <Text
            style={{
              color: '#524D4D',
              fontSize: 10,
              marginRight: 10,
              marginTop: 5,
              alignSelf: 'flex-start',
            }}>
            {moment(message.time).format('hh:mm')}
          </Text>
        </View>
      );
    }
    if (message.fattach !== null && message.fattach !== '') {
      content = (
        <View style={{alignSelf: 'flex-end', marginVertical: 10}}>
          <TouchableOpacity
            onPress={() => {
              downloadAndOpenDocument(message.fattach.attach);
            }}
            style={{
              backgroundColor: 'red',
              borderRadius: 8,
              elevation: 5,
              width: '80%',
              flexDirection: 'row',
              alignItems: 'center',
              padding: 10,
            }}>
            {sending ? (
              <ActivityIndicator animating size="large" color={'white'} />
            ) : (
              <Icon name="document" style={{color: 'white'}} />
            )}

            <View
              style={{
                paddingHorizontal: 16,
                width: '70%',
                alignSelf: 'flex-start',
              }}>
              <Text style={{color: 'white'}}>
                {
                  message.fattach.attach.split('/')[
                    message.fattach.attach.split('/').length - 1
                  ]
                }
              </Text>
            </View>
          </TouchableOpacity>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: 5,
            }}>
            <Text
              style={{
                color: '#524D4D',
                fontSize: 10,
                paddingLeft: 8,
              }}>
              {moment(message.time).format('hh:mm')}
            </Text>
            {sending ? (
              <Icon
                type="MaterialCommunityIcons"
                name="clock-time-nine"
                style={{
                  fontSize: 18,
                  color: 'red',
                }}
              />
            ) : (
              <Icon
                type="Ionicons"
                name="checkmark-done-sharp"
                style={{
                  fontSize: 16,
                  color: message.is_read === '1' ? '#34B7F1' : 'grey',
                }}
              />
            )}
          </View>
        </View>
      );
    }
  }

  if (msg_type === 'location') {
    if (message.tmsg !== '') {
      const {latitude, longitude} = JSON.parse(JSON.parse(message.tmsg));
      content = (
        <View
          style={{
            alignSelf: 'flex-start',
            marginVertical: 10,
          }}>
          <Lightbox onOpen={() => setOpen(true)} onClose={() => setOpen(false)}>
            <View
              style={{
                borderRadius: 8,
                elevation: 5,
                width: open ? '100%' : 200,
                height: open ? '100%' : 280,
              }}>
              <MapView
                provider={PROVIDER_GOOGLE} // remove if not using Google Maps
                style={{
                  flex: 1,
                  ...StyleSheet.absoluteFillObject,
                }}
                region={{
                  latitude,
                  longitude,
                  latitudeDelta: 0.015,
                  longitudeDelta: 0.0121,
                }}>
                <Marker coordinate={{latitude, longitude}} />
              </MapView>
            </View>
          </Lightbox>
          <Text
            style={{
              color: '#524D4D',
              fontSize: 10,
              marginRight: 10,
              marginTop: 5,
              alignSelf: 'flex-start',
            }}>
            {moment(message.time).format('hh:mm')}
          </Text>
        </View>
      );
    }
    if (message.fmsg !== '') {
      let location = null;
      if (sending) {
        location = JSON.parse(message.fmsg);
      } else {
        location = JSON.parse(JSON.parse(message.fmsg));
      }
      if (typeof location === 'string') {
        location = JSON.parse(location);
      }

      const {latitude, longitude} = location;

      content = (
        <View style={{alignSelf: 'flex-end', marginVertical: 10}}>
          <Lightbox onOpen={() => setOpen(true)} onClose={() => setOpen(false)}>
            <View
              style={{
                borderRadius: 8,
                elevation: 5,
                width: open ? '100%' : 200,
                height: open ? '100%' : 280,
              }}>
              <MapView
                provider={PROVIDER_GOOGLE} // remove if not using Google Maps
                style={{
                  flex: 1,
                  ...StyleSheet.absoluteFillObject,
                }}
                region={{
                  latitude,
                  longitude,
                  latitudeDelta: 0.015,
                  longitudeDelta: 0.0121,
                }}>
                <Marker coordinate={{latitude, longitude}} />
              </MapView>
            </View>
          </Lightbox>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: 5,
            }}>
            <Text
              style={{
                color: '#524D4D',
                fontSize: 10,
                paddingLeft: 8,
              }}>
              {moment(message.time).format('hh:mm')}
            </Text>
            {sending ? (
              <Icon
                type="MaterialCommunityIcons"
                name="clock-time-nine"
                style={{
                  fontSize: 18,
                  color: 'red',
                }}
              />
            ) : (
              <Icon
                type="Ionicons"
                name="checkmark-done-sharp"
                style={{
                  fontSize: 16,
                  color: message.is_read === '1' ? '#34B7F1' : 'grey',
                }}
              />
            )}
          </View>
        </View>
      );
    }
  }

  const inList = useMemo(() => {
    return forwardMessageIds.indexOf(message.id) !== -1;
  }, [forwardMessageIds]);

  return (
    <TouchableOpacity
      activeOpacity={1}
      style={
        inList
          ? {
              backgroundColor: 'rgba(0,0,0,0.2)',
            }
          : {}
      }
      onPress={() => {
        if (selectedMode) {
          if (!inList) {
            appendMessages(message.id);
            if (message.msg_type === 'text') {
              copyText({
                id: message.id,
                text: message.fmsg !== '' ? message.fmsg : message.tmsg,
              });
            }
          } else {
            removeMessages(message.id);
          }
        }
      }}
      onLongPress={() => {
        if (!selectedMode) {
          toggleSelectedMode();
          appendMessages(message.id);
          if (message.msg_type === 'text') {
            copyText({
              id: message.id,
              text: message.fmsg !== '' ? message.fmsg : message.tmsg,
            });
          }
        }
      }}>
      {content}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  Styleimage: {
    alignSelf: 'flex-start',
    marginTop: 2,
    width: 60,
    height: 60,
    padding: 15,
  },
});