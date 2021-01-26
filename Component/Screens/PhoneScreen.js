import React, { Component } from 'react'
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native'
import AsyncStorage from '@react-native-community/async-storage';
import resp from 'rn-responsive-font'
console.disableYellowBox = true

class PhoneScreen extends Component {
  constructor(props) {
    super(props)
    this.forgetCall = this.forgetCall.bind(this)
    this.state = {
      phone_number: '',
      fcmToken:'',
      baseUrl: 'http://www.cartpedal.com/frontend/web/',
    }
  }
  showLoading() {
    this.setState({ loading: true });
  }
componentDidMount(){
  AsyncStorage.getItem('@fcmtoken').then((token) => {
    console.log("Edit user id token=" +token);
    if (token) {
      this.setState({ fcmToken:JSON.parse(token) });
    }
  });
}
  hideLoading() {
    this.setState({ loading: false });
  }
  CheckTextInput = () => {
     if (this.state.phone_number === '') {
      alert('Please Enter Mobile Number')
    } else if (this.state.phone_number.length != '10') {
      alert('Please Enter Valid Mobile Number')
    } else {
      this.forgetCall();
      this.showLoading();

    }
  }
  forgetCall() {
    let formData = new FormData()
    formData.append('mobile', '+91' + this.state.phone_number)
    console.log('form data==' + JSON.stringify(formData))
   // var otpUrl= 'http://cartpadle.atmanirbhartaekpahel.com/frontend/web/api-user/send-otp'
    
    var otpUrl = this.state.baseUrl + 'api-user/send-otp'
    console.log('url:' + otpUrl)
    fetch(otpUrl, {
      method: 'Post',
      headers: {
        'Content-Type': 'multipart/form-data',
        device_id: '1234',
        device_token:this.state.fcmToken,
        device_type: 'android',
      },
      body: formData,
    })
      .then(response => response.json())
      .then(responseData => {
        this.hideLoading();
        if (responseData.code == '200') {
             console.log(JSON.stringify(responseData));
          this.props.navigation.navigate('SignUPWithOtpScreen', {
            mobile: responseData.data.mobile,
            otp: responseData.data.otp,
          })
        } else {

          alert(JSON.stringify(responseData.data))
        }
        console.log('phoneNumber=====',responseData.data.mobile)
        console.log('response object:', responseData)
       
      })
      .catch(error => {
        this.hideLoading();
        console.error(error)
      })

      .done()
  }

  render() {
    return (

      <View style={styles.container}>

        <View style={styles.headerContainer}>

          <View style={{ flex: .34, backgroundColor: '#F01738', flexDirection: 'row' }}>

            <TouchableOpacity
              onPress={() => this.props.navigation.goBack()}>
              <Image
                source={require('../images/back_white.png')}
                style={styles.MenuHomeIconStyle}
              />
            </TouchableOpacity>

          </View>

          <View style={{ flex: .33, backgroundColor: '#F01738' }}>

          </View>

          <View style={{ flex: .33, backgroundColor: '#F01738' }}>


          </View>


        </View>


        <View style={styles.logoContainer}>
          <Image
          source={require('../images/logo_cart_paddle.png')}
           // source={require('../images/Logo_icon2.png')}
            style={styles.ImageView}
          />
          <Text style={styles.CartTextStyle}>Cartpedal</Text>
        </View>

        <View style={styles.container3}>
          <View style={styles.PhoneBox}>
            <Text style={styles.UserName}>Phone Number</Text>
            <View style={styles.inputView}>
              <View style={{ flexDirection: 'row', marginLeft: 15 }}></View>

              <TextInput
                placeholder=''
                placeholderTextColor='#000'
                underlineColorAndroid='transparent'
                style={styles.input}
                keyboardType={'numeric'}
                maxLength={10}
                onChangeText={phone_number => this.setState({ phone_number })}
              />
            </View>

            <TouchableOpacity
              style={styles.loginButtonStyle}
              activeOpacity={0.2}
              onPress={() => {
                this.CheckTextInput()
              }}>
              <Text style={styles.buttonWhiteTextStyle}>Submit</Text>
            </TouchableOpacity>
            {this.state.loading && (
              <View style={styles.loading}>
                <ActivityIndicator size="large" color="#F01738" />
              </View>
            )}
          </View>
        </View>

      </View>

    )
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    backgroundColor: '#F01738',
  },


  CartTextStyle: {
    width: resp(204),
    height: resp(44),
    marginLeft: resp(20),
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: resp(5),
    fontSize: resp(37),
    color: '#fff',
    fontWeight: 'bold',
  },
  loading: {
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    opacity: 0.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container3: {
    flex: .6,
    width: '100%',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    borderTopLeftRadius: 60,
  },
  PhoneBox: {
    margin: resp(40),
  },
  logoContainer: {
    flex: .2,
    marginBottom: resp(60),
  },

  headerContainer: {
    flexDirection: 'row',
    flex: .2,
    backgroundColor: 'white',
  },
  MenuHomeIconStyle: {
    marginLeft: resp(10),
    marginTop: resp(20),
    height: resp(30),
    width: resp(26),
    alignItems: 'flex-start',
    alignSelf: 'flex-start',
    justifyContent: 'flex-start',
  },
  buttonWhiteTextStyle: {
    textAlign: 'center',
    fontSize: resp(16),
    color: 'white',
    alignContent: 'center',
  },
  ImageView: {
    height: resp(97.73),
    width: resp(93.75),
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: 'transparent',
  },
  UserName: {
    color: 'black',
    width: resp(340),
    fontSize: resp(12),
    textAlign: 'left',
    opacity: 0.5,
  },

  input: {
    color: 'black',
    height: 50,
    padding: 5,
    textAlign: 'left',
  },

  inputView: {
    width: '90%',
    marginBottom: 15,
    width: resp(350),
    borderColor: '#F01738',
    borderBottomWidth: 1,
  },
  loginButtonStyle: {
    marginTop: 10,
    width: resp(350),
    height: resp(50),
    padding: 10,
    backgroundColor: '#F01738',
    borderRadius: 40,
    justifyContent: 'center',
    alignSelf: 'center',
    alignItems: 'center',
  },
})

export default PhoneScreen
