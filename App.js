import React from 'react';
import { Alert, FlatList, StyleSheet, Text, View, Button ,Modal, TouchableHighlight,Dimensions} from 'react-native';
import {createStackNavigator, createAppContainer} from 'react-navigation';
import SelectMultiple from 'react-native-select-multiple'
import { TabView, TabBar, SceneMap } from 'react-native-tab-view';
import SocketIOClient from 'socket.io-client'
import { YellowBox } from 'react-native';

import Spinner from 'react-native-loading-spinner-overlay';
YellowBox.ignoreWarnings([
    'Unrecognized WebSocket connection option(s) `agent`, `perMessageDeflate`, `pfx`, `key`, `passphrase`, `cert`, `ca`, `ciphers`, `rejectUnauthorized`. Did you mean to put these under `headers`?'
]);
// I am aware of that I suppose to separate every class to its own file. 
// I will separate some class to its own file when it is fully ready to do not come back to it anymore and just use it.
class SignUpScreen extends React.Component {
  static navigationOptions = {
    title: 'Sign Up'
  }
  render(){
    return (
      <View style={styles.container}>
        <Text>This is Sign Up page</Text>
      </View>
    )
  }
}


const renderLabel = (label, style) => {
  return (
    <View style={{flexDirection: 'row', alignItems: 'center'}}>
      
      <View style={{marginLeft: 10}}>
        <Text style={style}>{label}</Text>
      </View>
    </View>
  )
}


class PrintfileScreen extends React.Component {
  constructor(props){
    super(props)
    this.socket = SocketIOClient('http://localhost:3006');
    this.socket.emit('alldocs', 'Hi server');
    this.state = {
      allFiles:[
      {label: 'Devin', value:'Devin', numberOfPages: 1},
      {label: 'Jackson',value: 'Jackson', numberOfPages: 2},
      {label: 'James',value:'James', numberOfPages: 3, pin:"1234"},
      {label: 'Joel',value:'Joel', numberOfPages: 4},
      {label: 'John',value:'John', numberOfPages: 5},
      {label: 'Jillian',value:'Jillian', numberOfPages: 6},
      {label: 'Jimmy',value:'Jimmy', numberOfPages: 7},
      {label: 'Julie',value:'Julie', numberOfPages: 8},
    ],
      selectedFiles:[],
      numberOfPages: 0,
      rate: props.rate?props.rate:10,
      index: 0,
    routes: [
      { key: 'first', title: 'First' },
      { key: 'second', title: 'Second' },
    ],
    spinner: false,
    modalVisible: false,
    pinFromModalWindow: "",
    currentModalFile:""
    }
    this.socket.on('scancard', (data) => {
      this.setState((prevState)=>({
        spinner: !prevState.spinner
      }), ()=>{
        console.log('Data recieved from server', data.ammounttopay, JSON.parse(data.docids)[0]); //this will console 'channel 2'
        console.log(this.state.spinner)
        setTimeout(() => {
          Alert.alert(
            'Scan Your Card',
            'Waiting card to be scanned...',
            [
              //{text: 'Ask me later', onPress: () => console.log('Ask me later pressed')},
              {
                text: 'Cancel',
                onPress: () => console.log('Cancel Pressed'),
                style: 'cancel',
              },
              {text: 'Test Select Files', onPress: this.onCardScannedForMakingSelection},
            ],
            {cancelable: false},
          );
        }, 100);
        
      })
    });
  }
  static navigationOptions = {
    title: 'Print File'
  }
  

  onSelectionsChange = (selectedFiles, item) => {
    
    // We need check if file is going to be checked or unchecked
    //if file requested to be checked
    if (selectedFiles.indexOf(item)){
      // if pin is set, then ask user to enter it
      if (this.state.allFiles.filter(file=> file.value==item.value)[0].pin!=undefined){
   //open modal and remember which document user is trying to check
    this.setState({ modalVisible: true,
      currentModalFile:item.value
    },()=>{
      // this.refreshNumberOfpages()
    })
   } else {
    this.setState({ selectedFiles
    },()=>{
      this.refreshNumberOfpages()
    })
   }
  }else{
    this.setState({ selectedFiles
    },()=>{
      this.refreshNumberOfpages()
    })
  }
    
  }

  refreshNumberOfpages = ()=> {
    this.setState({
      numberOfPages:this.state.allFiles.filter(file=>this.state.selectedFiles.map(file=>file.value).indexOf(file.value)>=0).map(file=>file.numberOfPages).reduce(this.sumForReduce,0),
      
    })
  }
  deselectAll = () => {
    this.setState({selectedFiles:[],
    numberOfPages:0})
  }

  selectFiles = (filesToSelect)=>{
    this.setState({selectedFiles:filesToSelect},
      ()=>{
      console.log(this.state.selectedFiles)
      this.refreshNumberOfpages()
    })
  }

  onCardScannedForMakingSelection = () => {
    //card scanned and socket came back to run selectFiles
    cardId = 1234567890;

    this.selectFiles([this.state.allFiles[0],this.state.allFiles[2]])
  }
  // Desided to not use this funcrion for simpler interface
  onSelectByCardPressed = () => {
    // run allert, send socket to scan card. 
    Alert.alert(
      'Scan Your Card',
      'Waiting card to be scanned...',
      [
        //{text: 'Ask me later', onPress: () => console.log('Ask me later pressed')},
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {text: 'Test Select Files', onPress: this.onCardScannedForMakingSelection},
      ],
      {cancelable: false},
    );
    //console.log(this.state.selectedFiles)
    // this.state.selectedFiles.map(itm=>console.log(itm.label))
  }
  onPrintPressed = () => {
    // console.log(this.state.selectedFiles)
    // run Spiner to wait for network request
    this.setState((prevState)=>({
          spinner: !prevState.spinner
    }));
    setTimeout(() => {
      this.socket.emit('docprintreq', {docids:['5bbc6eb7fd0aa14947a52064'],ammounttopay:20});
      
    }, 4000);
        
        // if request is not finished in 10 seconds then cancel
        setTimeout(() => {
          if (!!this.state.spinner){
          this.setState((prevState)=>({
                spinner: !prevState.spinner
              }),()=>{
                setTimeout(() => {
                  Alert.alert(
                    'No connection',
                    'No connection to the server. Sorry for inconvinience',
                    [
                      //{text: 'Ask me later', onPress: () => console.log('Ask me later pressed')},
                      {
                        text: 'Ok',
                        onPress: () => console.log('Cancel Pressed'),
                        style: 'cancel',
                      },])
                }, 100);
              });
            }
        },10000)
        // emulate card scanning
        // setTimeout(() => {
        //   if (!this.state.spinner){
        //   this.setState({
        //         spinner: !this.state.spinner
        //       },()=>{
                
        //       });
        //     }
        // },4000)


   
    // this.state.selectedFiles.map(itm=>console.log(itm.label))
  }
  sumForReduce = (total, num) => {
    //console.log(this.state.rate)
    return total + num
  }
  componentDidMount() {
    // setInterval(() => {
    //   this.setState({
    //     spinner: !this.state.spinner
    //   });
    // }, 3000);
  }

  setModalVisible(visible) {
    this.setState({modalVisible: visible});
  }

  onPinKeypadPresses = (key)=>{
    if (this.state.pinFromModalWindow.length!=4){
      this.setState((prevState)=>({pinFromModalWindow:prevState.pinFromModalWindow+parseInt(key.keypadbutton)}))
    }
    console.log(key)
    console.log(this.state.currentModalFile)
  }
  //check if pin correct and check the document
  onEnterPressed = ()=>{
    if (this.state.allFiles.filter((file)=> file.value==this.state.currentModalFile)[0].pin==this.state.pinFromModalWindow){
      this.setState((prevState)=>({selectedFiles:[...prevState.selectedFiles,
        this.state.allFiles.filter((file)=> file.value==this.state.currentModalFile)[0]],currentModalFile:"",pinFromModalWindow:""}))

    }
  }
  render(){
    // filter selected files 
    // this.state.allFiles.filter(file=>this.state.selectedFiles.map(file=>file.value).indexOf(file.value)>=0)
    return (
      <View style={styles.container}>
      <Spinner
          visible={this.state.spinner}
          textContent={'Loading...'}
          textStyle={styles.spinnerTextStyle}
        />
        <Modal
          animationType="slide"
          transparent={false}
          visible={this.state.modalVisible}
          supportedOrientations={["landscape","landscape-left", "landscape-right"]}
          onRequestClose={() => {
            Alert.alert('Modal has been closed.');
          }}>
          <View style={{marginTop: 22}}>
            <View>
              
              

              <View style={{flexDirection: 'row' }}>

              <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
                <Text>{"*".repeat(this.state.pinFromModalWindow.length)}</Text>
                {[1,2,3].map((row)=>
                  <View key={row} style={{flexDirection: 'row', }}> 
                    {[row==1?1:row==2?4:row==3?7:0,row==1?2:row==2?5:row==3?8:0,row==1?3:row==2?6:row==3?9:0].map((keypadbutton) => 
                      <View key={keypadbutton} style={styles.buttonContainer}>
                            <TouchableHighlight  onPress={()=>this.onPinKeypadPresses({keypadbutton})}>
                              <View style={styles.button}>
                                <Text style={styles.buttonText}>{keypadbutton}</Text>
                              </View>
                            </TouchableHighlight>
                      </View>
                    )}
                  </View>
                )}
              </View>

              <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
              <View style={styles.buttonContainer}>
              <TouchableHighlight
                onPress={() => {
                  this.setState(()=>({pinFromModalWindow:"",currentModalFile:""}))
                  this.setModalVisible(!this.state.modalVisible);
                }}>
                <Text>Cancel</Text>
              </TouchableHighlight>
              </View>
              <View  style={styles.buttonContainer}>
                <TouchableHighlight  onPress={()=>this.setState({pinFromModalWindow:""})}>
                  <View style={styles.button}>
                    <Text style={styles.buttonText}>Delete</Text>
                  </View>
                </TouchableHighlight>
              </View>
              <View  style={styles.buttonContainer}>
                <TouchableHighlight  onPress={()=>{this.onEnterPressed()}}>
                  <View style={styles.button}>
                    <Text style={styles.buttonText}>Enter</Text>
                  </View>
                </TouchableHighlight>
              </View>
              </View>

              </View>
            </View> 

          </View>
          
        </Modal>
        <View style={{
                flex:1,
                backgroundColor: 'skyblue',
                alignItems: 'center',
                justifyContent: 'stretch',}} >
          <Text>This is Print File page {this.props.navigation.getParam('name')}</Text>
          <Text>Number of Files selected: {this.state.selectedFiles.length}</Text>
          <Text>Number of Pages:  {this.state.numberOfPages}   Ammount to pay: {this.state.numberOfPages * this.state.rate} tenge.</Text>
          
        </View>

        <View style={{flex:5, backgroundColor: 'powderblue', flexDirection:'row'}} >
          <View style={{flex:2, backgroundColor:'yellow'}}>
          <TabView 
        navigationState={this.state}
        renderScene={SceneMap({
          first: ()=> (
    <View style={{flex:1, backgroundColor:'yellow'}}>
            <Text>1. Select files to print. Files you upload on FREPL.KZ will appear here</Text>
            <SelectMultiple
              items={this.state.allFiles}
              selectedItems={this.state.selectedFiles}
              renderLabel={renderLabel}  
              onSelectionsChange={this.onSelectionsChange} />
          </View>
  ),
          second: ()=> (
    <View style={{flex:1, backgroundColor:'yellow'}}>
            
            <View style={{flex:1, backgroundColor:'green'}}>
          <Text>2. Select action you want to perform:</Text>
          
          <View style={styles.buttonContainer}>
            
            <TouchableHighlight onPress={this.onPrintPressed}>
              <View style={styles.button}>
                <Text style={styles.buttonText}>Print Selected </Text>
              </View>
            </TouchableHighlight>
          </View>
        </View>
          </View>
    )
        })}
        onIndexChange={index => this.setState({ index })}
        initialLayout={{ width: Dimensions.get('window').width,height: Dimensions.get('window').height }}
        />

          </View>
        
        

        </View>
                
      </View>
    )
  }
}

class HowToScreen extends React.Component {
  static navigationOptions = {
    title: 'How To'
  }
  render(){
    return (
      <View style={styles.container}>
        <Text>This is How To page</Text>
        </View>
    )
  }
}

 class HomeScreen extends React.Component {
   static navigationOptions = {
     title: 'Welcome',
   }
  onChooseFileButtonPressed(){
    Alert.alert("Choose file pressed")
  }
  onHowToPrintPressed(){
    Alert.alert("How to print pressed")
  }
  onSignUpPressed(){

  }
  render() {
    const { navigate } = this.props.navigation;
    return (
      <View style={{
        justifyContent:'center',
        alignItems:'center'
      }}>
        <Text>Выбирите действие:</Text>
        <Button onPress={()=>navigate('PrintFile', {name:'Jane'})}
          title="I uploaded a file on FREPL.KZ and I want to print it" />
          <Button onPress={()=>navigate('HowTo', {name:'Jane'})}
          title="I did not upload a file on FREPL.KZ and I want to know how" />
          <Button onPress={()=>navigate('SignUp', {name:'Jane'})}
          title="I want to sign up" />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: '#fff',
    alignItems: 'stretch',
    justifyContent: 'center',
  },
  item: {
    height: 40,
    fontSize: 30
  },
  buttonContainer:{
    paddingTop: 10,
    alignItems: 'center'
  },
  
  button: {
    marginBottom: 30,
    alignItems: 'center',
    backgroundColor: '#2196F3'
  },
  buttonText: {
    padding: 20,
    color: 'white'
  },
  scene: {
    flex: 1,
  },
});
const AppNavigator = createStackNavigator({
  Home: {screen: HomeScreen},
  PrintFile: {screen:PrintfileScreen},
  HowTo: {screen:HowToScreen},
  SignUp: {screen:SignUpScreen},
})

export default createAppContainer(AppNavigator)