import React, { Component } from 'react';
import {
    StyleSheet,
    View,
    Text,
    Image,
    ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import resp from 'rn-responsive-font';
import firebase from 'react-native-firebase'
class SplashScreen extends Component {

    constructor(props) {
        super(props);
        this.state = {
         
        };
    }


    showLoading() {
        this.setState({ loading: true });
    }

    hideLoading() {
        this.setState({ loading: false });
    }

    static navigationOptions = {
        title: 'Splash'
    };


    componentDidMount() {
            
// firebase.links()
// .getInitialLink()
// .then((url) => {
//     console.log('the get url',url)
//     if (url) {
//         console.log('if url',url)
//         // app opened from a url
//     } else {
//         this.props.navigation.addListener('willFocus', this.load)
//        // app NOT opened from a url
//     }
// });
this.props.navigation.addListener('willFocus', this.load)  
    }

    componentWillUnmount() {

        clearTimeout(this.timeoutHandle); // This is just necessary in the case that the screen is closed before the timeout fires, otherwise it would cause a memory leak that would trigger the transition regardless, breaking the user experience.
    }

    load = () => {
      
        this.showLoading();

        this.timeoutHandle = setTimeout(() => {
            // Add your logic for the transition

            AsyncStorage.getItem('@is_login').then((isLogin) => {
                console.log('login screen',isLogin);
                if (isLogin == undefined || isLogin == "0") {
                    this.props.navigation.navigate('LoginScreen')
                } else if (isLogin == "1") {
                   this.props.navigation.navigate('DashBoardScreen')
               }
           });
            // AsyncStorage.getItem('@isSignUp').then((isSignUp) =>{
            //     if(isSignUp==undefined || isSignUp=='0'){
            //         this.props.navigation.navigate('LoginScreen')
            //     }else if(isSignUp=='1'){
            //         this.props.navigation.navigate('DashBoardScreen')
            //     }
            // })


        }, 4000);
       
    }
    

    render() {
        return (
            <View style={styles.container}>
            
               <Image source={require('../images/logo_cart_paddle.png')}
               style={styles.ImageView} />
               <View style={{justifyContent:'center',alignItems:'center'}}>
                  <Text style={styles.CartTextStyle}>Cartpedal</Text> 
                  </View>
            
                  {this.state.loading && (
                    <View style={styles.loading}>
                        <ActivityIndicator size="large" color="#F01738" />

                        

                    </View>
                )}

            </View>
             
           
  
        );
    }
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white'

    }, 
    ImageView:{
        height:150,
        width:150,
        backgroundColor: 'transparent'
    },
    CartTextStyle:{
        textAlign:"center",
        marginTop:resp(3),
        fontSize:resp(40),
        color:'#000',
        fontWeight:'bold',
        height:resp(60),
        width:resp(250)
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
    
});

export default SplashScreen;