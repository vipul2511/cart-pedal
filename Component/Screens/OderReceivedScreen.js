import React, { Component } from 'react'
console.disableYellowBox = true

import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Image,
  SafeAreaView,
  ScrollView,
  Share
} from 'react-native'
import resp from 'rn-responsive-font'
import CustomMenuIcon from './CustomMenuIcon'
import { withNavigation } from 'react-navigation';
import Toast from 'react-native-simple-toast'
import Spinner from 'react-native-loading-spinner-overlay';
import AsyncStorage from '@react-native-community/async-storage';
import SeeMore from 'react-native-see-more-inline';
import firebase from 'react-native-firebase';

class CartPlaceScreen extends Component {
  constructor(props) {
    super(props)
    this.CartListCall = this.CartListCall.bind(this),
    this.AddFavourite = this.AddFavourite.bind(this);
    this.AskForStautsCall = this.AskForStautsCall.bind(this);
      this.state = {
        OderRecevieProduct: '',
        spinner: '',
        userAccessToken:'',
      userNo:'',
      favourite:'',
      ButtomTab:false,
        NoData: '',
        quantity:'',
        Oder_id:'',
        block_id:'',
        total_price:'',
        fcmToken:'',
        redIcon:require('../images/Heart_icon.png'),
        whiteIcon:require('../images/dislike.png'),
        pickedImage:require('../images/default_user.png'),
        avatar:'',
        data: [
          {
            ImagePerson: require('../images/RiyaJainImage.png'),
            personName: 'Rahul Jain',
            Description: ' Description is the pattern of narrative',
            message_icon: require('../images/message_icon.png'),
            heart_icon: require('../images/Heart_icon.png'),
            View_all: 'View All',
            menuButtom: require('../images/more.png'),
            productImage: require('../images/ProductImage.png'),
            ItemName: 'Western Wear',
            ItemPrice: '500',
            productImage2: require('../images/ProductImage2.png'),
            ItemName2: 'Foot Wear',
            ItemPrice2: '300',
            productImage3: require('../images/ProductImages3.png'),
            ItemName3: 'Accessories ',
            ItemPrice3: '500',
            productImage4: require('../images/productImage6.png'),
            ItemName4: 'Ethnic Wear ',
            ItemPrice4: '300',
            productImage5: require('../images/productImage6.png'),
            ItemName4: 'Ethnic Wear ',
            ItemPrice4: '300',
            Cart_itemName: 'Cart Item',
            Cart_ItemValue: '12',
            Cart_itemName2: 'Cart Value',
            Cart_ItemValue2: '20',
            placeOder_button: 'Accepted'



          },
          {
            ImagePerson: require('../images/productImage4.png'),
            personName: 'Gaurav Jain',
            Description: ' Description is the pattern of narrative',
            message_icon: require('../images/message_icon.png'),
            heart_icon: require('../images/Heart_icon.png'),
            View_all: 'View All',
            menuButtom: require('../images/more.png'),
            productImage: require('../images/productImage4.png'),
            ItemName: 'Western Wear',
            ItemPrice: '120',
            productImage2: require('../images/productImage5.png'),
            ItemName2: 'Foot Wear',
            ItemPrice2: '216',
            productImage3: require('../images/productImage5.png'),
            ItemName3: 'Accessories ',
            ItemPrice3: '246',
            productImage4: require('../images/productImage6.png'),
            ItemName4: 'Ethnic Wear ',
            ItemPrice4: '296',
            productImage5: require('../images/productImage6.png'),
            ItemName4: 'Ethnic Wear ',
            ItemPrice4: '300',
            Cart_itemName: 'Cart Item',
            Cart_ItemValue: '12',
            Cart_itemName2: 'Cart Value',
            Cart_ItemValue2: '20',
            placeOder_button: 'Accepted'
          },
        ],
      }
  }

  showLoading() {
    this.setState({ spinner: true });
  }

  hideLoading() {
    this.setState({ spinner: false });
  }

  GotoNextScreen(item) {

    // this.props.navigation.navigate('CartViewScreen');
    console.log('Selected Item :', item)
  }
  actionOnRow(item) {
    console.log('Selected Item :', item)
  }
  async componentDidMount() {
    this.showLoading();
    AsyncStorage.getItem('@access_token').then((accessToken) => {
      if (accessToken) {
        this.setState({ userAccessToken: accessToken });
        console.log("Edit access token ====" + accessToken);
      }
    });
    AsyncStorage.getItem('@fcmtoken').then((token) => {
      console.log("Edit user id token=" +token);
      if (token) {
        this.setState({ fcmToken: token });
      }
    });
    AsyncStorage.getItem('@user_id').then((userId) => {
      if (userId) {
          this.setState({ userNo: userId });
          console.log(" id from login  user id ====" + this.state.userNo);
          this.CartListCall();
      }else{
        console.log("else is executed");
        this.hideLoading();
      }
  });
   

    //   AsyncStorage.getItem('@user_id').then((userId) => {
    //     if (userId) {
    //         this.setState( { userId: userId });
    //         console.log("Edit user id Dhasbord ====" + this.state.userId);
    //        // this.CartListCall();
    //     }
    // });

  }
  addQuantity=(data)=>{
    console.log("the data",data);
    let cart_quantity=0;
    let total_price=0;
      data.map(item=>{
        console.log(item.cartitem);
        cart_quantity=cart_quantity+item.cartitem;
        total_price=total_price+item.cartvalue;
      });
      console.log("the value of quantity"+cart_quantity);
      this.setState({quantity:cart_quantity});
      this.setState({total_price:total_price});
  }
  ListEmpty = () => {
    return (

      <View style={styles.container}>
        <Text style={{
          margin: resp(170),

        }}>{this.state.NoData ? 'No Record' : null} </Text>
      </View>
    );
  };
  CartListCall() {
    let formData = new FormData()

    formData.append('user_id', this.state.userNo)
    formData.append('type', 2)

console.log('token',this.state.userAccessToken);


    console.log('form data==' + JSON.stringify(formData))
    // var CartList = this.state.baseUrl + 'api-product/cart-list'
    var CartList = "http://www.cartpedal.com/frontend/web/api-product/cart-list"
    console.log('Add product Url:' + CartList)
    fetch(CartList, {
      method: 'Post',
      headers: new Headers({
        'Content-Type': 'multipart/form-data',
        device_id: '1111',
        device_token:this.state.fcmToken,
        device_type: 'android',
        Authorization: JSON.parse(this.state.userAccessToken),  
        // Authorization: 'Bearer k42uBT6HNYRZup8taAw3p5J8HsbUd50wBZ1VLSba'

      }),
      body: formData,
    })

      .then(response => response.json())
      .then(responseData => {
        this.hideLoading();
        if (responseData.code == '200') {
          //  this.props.navigation.navigate('StoryViewScreen')
         // Toast.show(responseData.message);
          if(responseData.data[0].avatar==null){
            this.setState({avatar:''})
          }else{
            this.setState({avatar:responseData.data[0].avatar});
          }
          if(responseData.data!==undefined&&responseData.data.length>0){
            console.log('if executed');
            this.setState({ButtomTab:true})
            this.setState({ OderRecevieProduct: responseData.data });
            this.addQuantity(responseData.data);
            console.log("blockId===",responseData.data[0].id);
            this.setState({block_id:responseData.data[0].id});
            this.setState({Oder_id:responseData.data[0].orderid})
            console.log('oderiD',responseData.data[0].orderid)
        }else{
        //  console.log('else executes');
        //   this.setState({ NoData: true });
        //   this.setState({OderRecevieProduct:''})
        }
          // this.SaveProductListData(responseData)

        } else {
          // alert(responseData.data);
          // alert(responseData.data.password)
          this.setState({ NoData: true });
        }

        console.log('response object:', responseData)
        console.log('User user ID==', JSON.stringify(responseData))
        // console.log('access_token ', this.state.access_token)
        //   console.log('User Phone Number==' + formData.phone_number)
      })
      .catch(error => {
        this.hideLoading();
        console.error(error)
      })

      .done()

  }
  AskForStautsCall(orderID,blockID) {
    let formData = new FormData()
      
      formData.append('user_id', this.state.userNo)
      formData.append('type', 1)
      formData.append('order_id', orderID)
      formData.append('block_id', blockID)
  
  
      console.log('form data for ask==' + JSON.stringify(formData))
     // var CartList = this.state.baseUrl + 'api-product/cart-list'
      var AskForStautsURL = "http://www.cartpedal.com/frontend/web/api-product/order-status"
      console.log(' AskForStautsURL :' + AskForStautsURL)
      fetch(AskForStautsURL, {
        method: 'Post',
        headers: new Headers({
          'Content-Type': 'multipart/form-data',
          device_id: '1111',
          device_token:this.state.fcmToken,
          device_type: 'android',
          Authorization: JSON.parse(this.state.userAccessToken),  
          // Authorization: 'Bearer xriPJWJGsQT-dUgP4qH11EMM357_kEaan7zJ4Vty'
  
        }),
        body: formData,
      })
  
        .then(response => response.json())
        .then(responseData => {
          this.hideLoading();
          if (responseData.code == '200') {
             //  this.props.navigation.navigate('StoryViewScreen')
             //   Toast.show(responseData.message);
            
                alert('Order is Accepted Successfully');
          } else {
            // alert(responseData.data);
            // alert(responseData.data.password)
            alert(responseData.message);
          }
  
          console.log('response object ask for:', responseData)
           console.log('User user ID==', JSON.stringify(responseData))
          //  console.log('response ID:', responseData.data[0].id)
          // console.log('access_token ', this.state.access_token)
          //   console.log('User Phone Number==' + formData.phone_number)
        })
        .catch(error => {
         this.hideLoading();
          console.error(error)
        })
  
        .done()
  
  }
  AddFavourite(block_id){
    this.showLoading();
    let id=this.state.userNo;
    let formData = new FormData();
      
    formData.append('user_id', id);
    formData.append('block_id',block_id);
    formData.append('type', 1);
    console.log('form data==' + JSON.stringify(formData));
    console.log('blcok_ID====',block_id);


  // var CartList = this.state.baseUrl + 'api-product/cart-list'
    var fav = "http://www.cartpedal.com/frontend/web/api-user/block-fav-user"
    console.log('Add product Url:' + fav)
    fetch(fav, {
      method: 'Post',
      headers: new Headers({
        'Content-Type': 'multipart/form-data',
        device_id: '1111',
        device_token: this.state.fcmToken,
        device_type: 'android',
        // Authorization: 'Bearer' + this.state.access_token,  
        Authorization:JSON.parse(this.state.userAccessToken), 
      }),
      body: formData,
    })
      .then(response => response.json())
      .then(responseData => {
      this.hideLoading();
        if (responseData.code == '200') {
        //  this.props.navigation.navigate('StoryViewScreen')
       //   Toast.show(responseData.message);
          // this.RecentShareCall();
          this.CartListCall();
        } else {
          // alert(responseData.data);
          // alert(responseData.data.password)
           this.setState({NoData:true});
        }
        console.log('response object:', responseData)
        console.log('User user ID==', JSON.stringify(responseData))
      })
      .catch(error => {
        this.hideLoading();
        console.error(error)
      })
      .done();
  }

  async SaveLoginUserData(responseData) {
    await AsyncStorage.setItem('@user_id', responseData.data.userid.toString());
    await AsyncStorage.setItem('@access_token', responseData.data.access_token.toString());


  }
  onShare = async (links) => {
    try {
      const result = await Share.share({
        message:
          `Get the product at ${links}`,
          url:`${links}`
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error) {
      alert(error.message);
    }
  };
link =async()=>{
 const link= new firebase.links.DynamicLink('https://play.google.com/store/apps/details?id=in.cartpedal', 'cartpedal.page.link')
  .android.setPackageName('com.cart.android')
  .ios.setBundleId('com.cart.ios');
  // let url = await firebase.links().getInitialLink();
  // console.log('incoming url', url);

firebase.links()
  .createDynamicLink(link)
  .then((url) => {
    console.log('the url',url);
    this.onShare(url);
  });
}
forwardlink =async(userid)=>{
  const link= new firebase.links.DynamicLink('https://play.google.com/store/apps/details?id=in.cartpedal', 'cartpedal.page.link')
   .android.setPackageName('com.cart.android')
   .ios.setBundleId('com.cart.ios');
   // let url = await firebase.links().getInitialLink();
   // console.log('incoming url', url);
 
 firebase.links()
   .createDynamicLink(link)
   .then((url) => {
     console.log('the url',url);
    //  this.sendMessage(url,userid);
    AsyncStorage.getItem('@Phonecontacts').then((NumberFormat=>{
      if(NumberFormat){
        let numID=JSON.parse(NumberFormat)
      //   this.setState({PhoneNumber:numID})
  this.props.navigation.navigate('ForwardLinkScreen', {
    fcmToken: this.state.fcmToken,
    PhoneNumber: numID,
    userId: this.state.userNo,
    userAccessToken: this.state.userAccessToken,
    msgids: url,
  });
}
}));
   });
 }


  render() {
    return (
      <SafeAreaView style={styles.container}>
        <Spinner
          visible={this.state.spinner}
          color='#F01738'
          // textContent={'Loading...'}
          textStyle={styles.spinnerTextStyle}
        />

        <View style={styles.MainContentBox}>

          <View style={styles.hairline} />

          <FlatList
            style={{ flex: .85 }}
            data={this.state.OderRecevieProduct}
            // renderItem={({ item }) => <ParsonProfile item={item} />}
            keyExtractor={(item,index) =>index}
            renderItem={({ item,index }) => {
              console.log('order recevied',JSON.stringify(item));
              return(
                <View>
                {item.products[0]?(  <TouchableOpacity style={styles.itemBox} onPress={()=>{this.props.navigation.navigate('OrderRecievedViewScreen',{ id: item.id, name: item.name,wholeData:item })}}>
                <View style={styles.box}>
                  <View style={styles.ProfileImageContainer}>
                    <TouchableOpacity>
                      <Image
                       source={item.avatar==null?(this.state.pickedImage):{uri:item.avatar}}
                        style={styles.ProfileImageViewStyle}
                      />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.ProfileInfoContainer}>
                    <Text style={styles.PersonNameStyle}>{item.name}</Text>
                    {/* <Text style={styles.ProfileDescription}>{item.about}</Text> */}
                    <View style={{width:resp(520)}}>
                    {item.about? (<SeeMore style={styles.ProfileDescription} numberOfLines={2}  linkColor="red" seeMoreText="read more" seeLessText="read less">
                        {item.about.substring(0,55)+"..."}
                  </SeeMore>):null}
                  <Text style={{color:'grey',marginBottom:10}}>Order id:{item.orderid}  {item.date},{item.time}</Text>
                  </View>
                  </View>
                  <View style={styles.ListMenuContainer}>
                    <TouchableOpacity style={styles.messageButtonContainer} onPress={() => {
            console.log('id of user',item.id);
            this.props.navigation.navigate('ChatDetailScreen',{userid:item.id, username:item.name,userabout:item.about,useravatar:item.avatar, groupexit:false,groupId:0,msg_type:"0"})
                      }}>
                        <Image
                          source={require('../images/message_icon.png')}
                          style={styles.messageButtonStyle}></Image>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={()=>{this.AddFavourite(item.id)}} style={styles.messageButtonContainer}>
                  <Image
                source={item.favourite==1?this.state.redIcon:this.state.whiteIcon}
                style={[styles.heartButtonStyle,{width:item.favourite==1?resp(11):resp(18),height:item.favourite==1?resp(9):resp(18),marginTop:item.favourite==1?resp(4):resp(0)}]}></Image>
            </TouchableOpacity>
                    <TouchableOpacity style={styles.ViewButtonContainer} onPress={()=>{this.props.navigation.navigate('OrderRecievedViewScreen',{ id: item.id, name: item.name,wholeData:item })}}> 
                        <Text style={styles.viewButtonStyle}>View All</Text>
                    </TouchableOpacity>
                    <CustomMenuIcon
                      //Menu Text
                      menutext='Menu'
                      //Menu View Style
                      menustyle={{
                        marginRight: 5,
                        flexDirection: 'row',
                        justifyContent: 'flex-end',
                      }}
                      //Menu Text Style
                      textStyle={{
                        color: 'white',
                      }}
                      //Click functions for the menu items
                      option1Click={() => {
                        this.link()
                        // Toast.show('CLicked Shared Link', Toast.LONG)
                      }}
                      option2Click={() => {
                        this.forwardlink()
                        // Toast.show('CLicked Forward Link', Toast.LONG)
                      }}
                    />
                  </View>
                </View>
                <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
                  <View style={styles.columnView}>
                   <View style={styles.ImageContainer}>
                      <Image
                        source={{ uri: item.products[0].image }}
                        style={styles.ImageContainer}></Image>
                      <Text style={styles.itemNameStyle}>{item.products[0].name}</Text>
                      <Text style={styles.itemPriceStyle}>
                        {'\u20B9'}
                        {item.products[0].price}
                      </Text>
                    </View>
                    {/* <View style={styles.ImageContainer}>
                      <Image
                        source={{ uri: item.products[0].image }}
                        style={styles.ImageContainer}></Image>
                      <Text style={styles.itemNameStyle}>{item.products[0].name}</Text>
                      <Text style={styles.itemPriceStyle}>
                        {'\u20B9'}
                        {item.products[0].price}
                      </Text>
                    </View>
                    <View style={styles.ImageContainer}>
                      <Image
                        source={{ uri: item.products[0].image }}
                        style={styles.ImageContainer}></Image>
                      <Text style={styles.itemNameStyle}>{item.products[0].name}</Text>
                      <Text style={styles.itemPriceStyle}>
                        {'\u20B9'}
                        {item.products[0].price}
                      </Text>
                    </View>
                    <View style={styles.ImageContainer}>
                      <Image
                        source={{ uri: item.products[0].image }}
                        style={styles.ImageContainer}></Image>
                      <Text style={styles.itemNameStyle}>{item.products[0].name}</Text>
                      <Text style={styles.itemPriceStyle}>
                        {'\u20B9'}
                        {item.products[0].price}
                      </Text>
                    </View> */}
                  </View>


                </ScrollView>
                <View style={styles.ItemCountContainer}>
                  <View style={styles.CartValueContainer}>
                    <View style={styles.CartItemContainer}>
                      <Text style={styles.CartItemTextStyle}>Cart Item</Text>
                      <Text style={styles.CartValueTextStyle}>{item.cartitem}</Text>
                    </View>
                    <View style={styles.CartItemContainer}>
                      <Text style={styles.CartItemTextStyle}>Cart Value</Text>
                      <Text style={styles.CartValueTextStyle}>{item.cartvalue}</Text>
                    </View>
                  </View>
                  <View style={styles.PlacedHolderButtonContainer}>
                    <TouchableOpacity
                     onPress={() => {
                      this.AskForStautsCall(item.orderid,item.id)
                  }}>
                      <View style={styles.PlacedButtonStyle}>
                        <Text style={styles.PlaceHolderTextStyle}>Accepted</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>


                <View style={styles.hairline} />
              </TouchableOpacity>
                ):null}
                </View>
            )}
                }
                 ListEmptyComponent={this.ListEmpty}
          />
        {this.state.ButtomTab==true?(
          <View style={styles.BottomContainer}>
            <View style={styles.BottomQuanitityContainer}>
              <Text style={styles.OderTextStyle}>Total Order Quanitity</Text>
              <Text style={styles.OderTextNumberStyle}>{this.state.quantity}</Text>
            </View>
            <View style={styles.BottomValueContainer}>
              <Text style={styles.OderValueTextStyle}>Total Order Value</Text>
              <Text style={styles.OderValueTextNumberStyle}>{'\u20B9'}{this.state.total_price}</Text>
            </View>

          </View>
        ):null}
          
        </View>

      </SafeAreaView>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#F6F9FE',
  },
  Profile2Container: {
    color: '#fff',
    flexDirection: 'row',
  },
  ProfileContainer: {
    height: resp(414),
    color: 'red',
    flexDirection: 'row',
  },

  PersonNameStyle: {
    marginTop: resp(10),
    width: resp(80),
    height: resp(20),
    color: '#000',
    fontWeight: 'bold',
  },
  ProfileDescription: {
    marginRight: resp(-2),
    width: resp(260),
    height: resp(50),
    color: '#7F7F7F',
    fontSize: resp(12),
  },
  Profile2ImageContainer: {
    margin: resp(10),
    flexDirection: 'column',
    flex: 0.2,
    width: resp(70),
    height: resp(70),
  },
  ProfileImageContainer: {
    margin: resp(10),
    flexDirection: 'column',
    flex: 0.2,
    width: resp(70),
    height: resp(70),
    // marginRight:10
  },
  spinnerTextStyle: {
    color: '#F01738'
  },
  box: {
    marginTop: resp(5),
    width: resp(415),
    height: resp(75),
    backgroundColor: 'white',
    flexDirection: 'row',
    shadowColor: 'black',
    shadowOpacity: 0.2,
    shadowOffset: {
      height: 2,
      width: 5,
    },
    elevation: 0,
  },
  ItemCountContainer: {
    marginLeft: resp(20),
    marginTop: resp(5),
    width: resp(415),
    height: resp(75),
    flexDirection: 'row',
    shadowColor: 'black',
    shadowOpacity: 0.2,
    shadowOffset: {
      height: 2,
      width: 5,
    },
    elevation: 0,
  },
  CartItemContainer: {
    flex: 0.5,
    height: resp(22),
    width: resp(130),
    margin: resp(5),
    flexDirection: 'row',

  },
  PlacedButtonStyle: {
    marginLeft: resp(40),
    height: resp(40),
    width: resp(130),
    marginTop: resp(20),
    backgroundColor: '#FFCF33',


  },
  PlaceHolderTextStyle: {
    marginTop: resp(10),
    alignSelf: 'center',
    height: resp(25),
    fontWeight: 'bold',
    fontSize: 15,
    color: "#2B2B2B",

  },
  PlaceHolderTextStyle2: {
    marginTop: resp(20),
    alignSelf: 'center',

    height: resp(18),
    fontWeight: 'bold',
    fontSize: 15,
    color: "#2B2B2B",

  },
  CartItemTextStyle: {
    width: resp(80),
    height: resp(18),

    fontSize: 15,
    color: "#2B2B2B"
  },
  CartValueTextStyle: {
    marginLeft: resp(20),
    width: resp(50),
    height: resp(18),
    fontWeight: 'bold',
    fontSize: 15,
    color: "#2B2B2B",

  },

  CartValueContainer: {
    margin: resp(5),
    width: resp(150),
    height: resp(65),
    flex: 0.5,
    flexDirection: 'column',
    shadowColor: 'black',
    shadowOpacity: 0.2,
    shadowOffset: {
      height: 2,
      width: 5,
    },
    elevation: 0,
  },
  PlacedHolderButtonContainer: {
    marginBottom: resp(20),
    margin: resp(5),
    width: resp(150),
    height: resp(70),
    flex: 0.5,
    flexDirection: 'column',
    shadowColor: 'black',
    shadowOpacity: 0.2,
    shadowOffset: {
      height: 2,
      width: 5,
    },
    elevation: 0,
  },
  itemBox: {
    height: resp(400),
    backgroundColor: 'white',
    flexDirection: 'column',
    shadowColor: 'black',
    shadowOpacity: 0.2,
    shadowOffset: {
      height: 1,
      width: 5,
    },
    elevation: 0,
  },

  Profile2ImageViewStyle: {
    margin: resp(10),
    width: resp(70),
    height: resp(70),
    borderRadius: resp(10),
  },
  ProfileImageViewStyle: {
    margin: resp(10),
    width: resp(50),
    height: resp(50),
    borderRadius: resp(8),
  },
  MenuIconStyle: {
    marginTop: resp(4),
    width: resp(3.44),
    height: resp(15.33),
  },
  horizontalLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: resp(2),
  },
  ColumView: {
    flexDirection: 'column',
  },

  RecentViewStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: resp(2),
    height: resp(35),
    backgroundColor: '#F1F0F2',
    width: '100%',
  },
  RecentTextStyle: {
    fontSize: resp(14),
    marginTop: resp(30),
    marginLeft: resp(10),
    height: resp(50),
    color: '#8E8E8E',
  },
  margintop: {
    marginTop: '10',
  },
  ImageViewStyle: {
    margin: resp(8),
    width: resp(55),
    height: resp(55),
    borderWidth: 2,
    borderColor: '#F01738',
  },
  hairline: {
    backgroundColor: '#C8C7CC80',
    height: 2,
    width: '100%',
  },
  headerBox: {
    width: '100%',
    flex: 0.1,
    color: 'black',
  },
  MainContentBox: {
    flex: 1,
  },
  rowGray: {
    color: 'black',
    width: '100%',
    height: 50,
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
    marginTop: 0,
    marginLeft: 10,
    textAlign: 'center',
  },
  ImageContainer: {
    marginTop: resp(-8),
    flexDirection: 'column',
    width: resp(140),
    height: resp(133),
    marginLeft: resp(10),
    borderRadius: resp(5),
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
  StatusAddStyle: {
    width: 20,
    height: 20,
    alignSelf: 'flex-end',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute', //Here is the trick
    bottom: 20,
  },

  StatusAddLargeStyle: {
    marginTop: resp(-20),
    marginLeft: resp(60),
    width: resp(30),
    height: resp(30),

    position: 'absolute', //Here is the trick
    bottom: 0,
  },
  Profile2InfoContainer: {
    color: '#fff',
    margin: resp(10),
    marginTop: resp(20),
    flexDirection: 'column',
    flex: 0.6,
    width: resp(70),
    height: resp(70),
  },
  ProfileInfoContainer: {
    margin: resp(15),
    marginTop: resp(15),
    flexDirection: 'column',
    flex: 0.8,
    width: resp(70),
    height: resp(70),
  },

  RiyaMenuContainer: {
    margin: resp(15),
    marginTop: resp(20),
    flexDirection: 'row',
    flex: 0.2,
    width: resp(80),
    height: resp(70),
  },
  ListMenuContainer: {
    marginTop: resp(20),
    marginLeft:resp(20),
    flexDirection: 'row',
    flex: 0.8,
     width: resp(0),
    height: resp(40),
  },
  openButtonStyle: {
    color: '#06BE7E',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: resp(10),
  },
  viewButtonStyle: {
    color: '#000',
    // marginRight: -20,
    fontSize:resp(14),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: resp(2),
    marginRight:resp(5)
  },

  openButtonContainer: {
    width: resp(60),
    height: resp(24),
    borderRadius: resp(20),
    backgroundColor: '#e6f7f2',
  },
  messageButtonContainer: {
    margin: resp(5),
    marginTop: resp(5),
    width: resp(18),
    height: resp(18),
    borderRadius: resp(50),
    backgroundColor: '#ebced7',
  },
  messageButtonStyle: {
    marginTop: resp(5),
    color: '#F01738',
    width: resp(8),
    height: resp(8),
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartButtonStyle: {
    marginTop: resp(4),
    color: '#F01738',
    width: resp(10),
    height: resp(8),
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ViewButtonContainer: {
    width: resp(60),
    height: resp(24),
    backgroundColor: '#fff',
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
  columnView: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabButtonStyle: {
    flex: 0.25,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
  },
  storyTextView: {
    color: '#887F82',
    fontSize: resp(10),

    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
  },
  itemNameStyle: {
    color: '#887F82',
    fontSize: resp(12),
    marginLeft: resp(15),

  },
  itemPriceStyle: {
    color: '#000',
    fontWeight: 'bold',
    marginLeft: resp(17),
    fontSize: resp(12),
    alignItems: 'center',


  },
  BottomContainer: {
    flex: .15,
    width: '100%',
    flexDirection: 'row',
    margin: resp(2),

  },
  BottomQuanitityContainer: {
    flex: 0.5,
    flexDirection: 'column',
    backgroundColor: '#FFFFFF'
  },
  BottomValueContainer: {
    flex: 0.5,
    flexDirection: 'column',
    backgroundColor: '#F01738'
  },

  OderTextStyle: {
    color: '#7F7F7F',
    marginTop: resp(10),
    marginLeft: resp(7),
    fontSize: resp(12),
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
  },
  OderTextNumberStyle: {
    color: '#F01738',
    marginLeft: resp(7),
    fontSize: resp(16),
    fontWeight: 'bold',
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
  },
  OderValueTextStyle: {
    color: '#FFFFFF',
    marginTop: resp(10),
    marginLeft: resp(7),
    fontSize: resp(12),
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
  },
  OderValueTextNumberStyle: {
    color: '#FFFFFF',
    marginLeft: resp(7),
    fontSize: resp(20),
    fontWeight: 'bold',
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
  },
})
export default withNavigation(CartPlaceScreen)
