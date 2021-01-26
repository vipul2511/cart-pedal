/* eslint-disable prettier/prettier */
import React, { Component } from 'react'
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native'
import resp from 'rn-responsive-font'
console.disableYellowBox = true
import Toast from 'react-native-simple-toast';


var otp

class ResetPasswordScreen extends Component {
  constructor(props) {
    super(props)
    this.ResetPasswordCall = this.ResetPasswordCall.bind(this);
    this.state = {
      new_password: '',
      confirm_password: '',
      baseUrl: 'http://www.cartpedal.com/frontend/web/'
   //   baseUrl: 'http://cartpadle.atmanirbhartaekpahel.com/frontend/web/'
    }
  }
  showLoading() {
    this.setState({ loading: true });
  }

  hideLoading() {
    this.setState({ loading: false });
  }
  componentDidMount() {
    const { navigation } = this.props

    otp = navigation.getParam('otp', 'no-otp')

    // this.setState({otp:otp})
    console.log(" in next screen To print ", otp)

  }
  CheckTextInput = () => {


    if (this.state.new_password === '') {
      //Check for the Name TextInput
      alert('Please Enter Password');

    }
    else if (this.state.new_password != this.state.confirm_password) {
      alert('Not Match Password');
    }


    else {
      this.ResetPasswordCall();
      this.showLoading();
    }

  };
  ResetPasswordCall() {
    let formData = new FormData()

    formData.append('password', this.state.new_password)

    formData.append('otp', otp)
    console.log('form data==' + JSON.stringify(formData))

    var resetPassword = this.state.baseUrl + 'api-user/reset-password'
    console.log('Login Url:' + resetPassword)
    fetch(resetPassword, {
      method: 'Post',
      headers: {
        'Content-Type': 'multipart/form-data',
        device_id: '1234',
        device_token: '1111',
        device_type: 'android',
      },
      body: formData,
    })
      .then(response => response.json())
      .then(responseData => {
        this.hideLoading();
        if (responseData.code == '200') {
          this.props.navigation.navigate('LoginScreen')

        //  Toast.show(responseData.message);

        } else {
          alert(responseData.data.password);


        }

        console.log('response object:', responseData)

      })
      .catch(error => {
        console.error(error)
      })

      .done()
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.headerView}>
          <TouchableOpacity
            onPress={() => this.props.navigation.goBack()}>
            <Image
              source={require('../images/back_icon.png')}
              style={styles.MenuHomeIconStyle}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.MainContainer}>
          <Text style={styles.HeadingText}>Reset Password ?</Text>

          <View style={styles.box}></View>
          <Text style={styles.UserName}>New Password</Text>
          <View style={styles.inputView1}>
            <View style={{ flexDirection: 'row', marginLeft: 15 }}></View>

            <TextInput
              placeholder=''
              placeholderTextColor='#000'
              underlineColorAndroid='transparent'
              style={styles.input}
              secureTextEntry={true}
              onChangeText={confirm_password => this.setState({ confirm_password })}
            />
          </View>
          <Text style={styles.UserName}>Conform Password</Text>
          <View style={styles.inputView1}>
            <View style={{ flexDirection: 'row', marginLeft: 15 }}></View>

            <TextInput
              placeholder=''
              placeholderTextColor='#000'
              underlineColorAndroid='transparent'
              style={styles.input}
              secureTextEntry={true}
              onChangeText={new_password => this.setState({ new_password })}
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
    )
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,

    backgroundColor: '#fff',
  },
  box: {
    marginTop: 60,
  },
  buttonWhiteTextStyle: {
    textAlign: 'center',
    fontSize: resp(16),
    color: 'white',
    alignContent: 'center',
  },

  UserName: {
    color: 'gray',
    width: resp(350),
    fontSize: resp(12),
    textAlign: 'left',
  },
  HeadingText: {
    color: 'black',
    width: resp(355),
    fontSize: resp(30),
    fontWeight: 'bold',
    textAlign: 'left',
  },
  headerView: {
    flex: 0.1,
    margin: resp(20),
    flexDirection: 'row',
    alignItems: 'flex-start',
    alignSelf: 'flex-start',
    height: 50,
    backgroundColor: '#fff',
  },
  MainContainer: {
    flex: 0.9,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  MenuHomeIconStyle: {
    height: 30,
    width: 30,
    alignItems: 'flex-start',
    justifyContent: 'flex-start'

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
  color: {
    color: 'red',
  },

  input: {
    color: 'black',
    width: 300,
    height: 50,
    padding: 10,
    textAlign: 'left',
  },

  inputView1: {
    width: '90%',
    marginBottom: 15,
    alignSelf: 'center',
    borderColor: '#f2000c',
    borderBottomWidth: 1,
  },
  loginButtonStyle: {
    marginTop: 30,
    width: resp(350),
    height: resp(50),
    padding: 10,
    backgroundColor: '#f2000c',
    borderRadius: 40,
    justifyContent: 'center',
    alignSelf: 'center',
    alignItems: 'center',
  },
})

export default ResetPasswordScreen
