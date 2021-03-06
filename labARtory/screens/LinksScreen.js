import React from 'react';
import {
  ActivityIndicator,
  Button,
  Clipboard,
  Image,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  FlatList,
} from 'react-native';
import * as Constants from 'expo-constants'
import * as Permissions from 'expo-permissions'
import * as ImagePicker from 'expo-image-picker'
import uuid from 'uuid';
import Environment from "../config/environment";
import firebase from "../utils/firebase";
import * as WebBrowser from 'expo-web-browser';

console.disableYellowBox = true;

export default class App extends React.Component {
  state = {
    image: null,
    uploading: false,
    googleResponse: null,
    analyze:true
  };
  
  async componentDidMount() {
    await Permissions.askAsync(Permissions.CAMERA_ROLL);
    await Permissions.askAsync(Permissions.CAMERA);
  }

  render() {

    let { image } = this.state;



    return (

      <View style={styles.container}>

        <ScrollView

          style={styles.container}

          contentContainerStyle={styles.contentContainer}

        >

          <View style={styles.welcomeContainer}>

            <Image

              source={

                __DEV__

                  ? require("../assets/images/LabARtory2.png")

                  : require("../assets/images/LabARtory2.png")

              }

              style={styles.welcomeImage}

            />

          </View>

          <View style={styles.helpContainer}>

          <View  style={{alignItems: 'center'}}>
          <TouchableOpacity onPress={this._pickImage} style={styles.helpLink}>
              <Text style={styles.button}>Pick an Image from Camera Roll</Text>
          </TouchableOpacity>
          </View>
          
          <Text> </Text>

          <View  style={{alignItems: 'center'}}>
          <TouchableOpacity onPress={this._takePhoto} style={styles.helpLink}>
              <Text style={styles.button}>Take a Photo</Text>
          </TouchableOpacity>
          </View>

            {this.state.googleResponse && (

              <FlatList

                data={this.state.googleResponse.responses[0].textAnnotations}
                renderItem={({item, index}) => <Text

                onPress={this._copyToClipboard}
      
                onLongPress={this._share}
      
                style={{fontSize: 8 }}
      
              > {item.description}</Text>}

              />

            )}

            {this._maybeRenderImage()}

            {this._maybeRenderUploadingOverlay()}

          </View>

        </ScrollView>

      </View>

    );

  }


  _maybeRenderUploadingOverlay = () => {

    if (this.state.uploading) {

      return (

        <View

          style={[

            StyleSheet.absoluteFill,

            {

              backgroundColor: "rgba(0,0,0,0.4)",

              alignItems: "center",

              justifyContent: "center"

            }

          ]}

        >

          <ActivityIndicator color="#fff" animating size="large" />

        </View>

      );

    }

  };



  _maybeRenderImage = () => {

    let { image, googleResponse } = this.state;

    if (!image) {

      return;

    }

    if(this.state.analyze == true){
      return (

        <View
  
          style={{
  
            marginTop: 20,
  
            width: 250,
  
            borderRadius: 3,
  
            elevation: 2
  
          }}
  
        >
  
  <View  style={{alignItems: 'center'}}>
          <TouchableOpacity onPress={() => this.submitToGoogle()} style={styles.helpLink}>
              <Text style={styles.button2}>... Analyze ... </Text>
          </TouchableOpacity>
  </View>
  
        
  
          <View
  
            style={{
  
              borderTopRightRadius: 3,
  
              borderTopLeftRadius: 3,
  
              shadowColor: "rgba(0,0,0,1)",
  
              shadowOpacity: 0.2,
  
              shadowOffset: { width: 4, height: 4 },
  
              shadowRadius: 5,
  
              overflow: "hidden"
  
            }}
  
          >
  
            <Image source={{ uri: image }} style={{ width: 250, height: 250 }} />
  
        </View>
          
        
  
        </View>
  
      );
      
    }
    else{
      return (

        <View
  
          style={{
  
            marginTop: 20,
  
            width: 250,
  
            borderRadius: 3,
  
            elevation: 2
  
          }}
  
        >
  
        <View  style={{alignItems: 'center'}}>
          <TouchableOpacity onPress={handleHelpPress} style={styles.helpLink}>
              <Text style={styles.button3}>Visualize</Text>
          </TouchableOpacity>
        </View>
  
        
  
          <View
  
            style={{
  
              borderTopRightRadius: 3,
  
              borderTopLeftRadius: 3,
  
              shadowColor: "rgba(0,0,0,1)",
  
              shadowOpacity: 0.2,
  
              shadowOffset: { width: 4, height: 4 },
  
              shadowRadius: 5,
  
              overflow: "hidden"
  
            }}
  
          >
  
            <Image source={{ uri: image }} style={{ width: 250, height: 250 }} />
  
        </View>
  
        </View>
  
      );
    }
    

  };

  

  _keyExtractor = (item, index) => item.id;



  _renderItem = item => {

    <Text>response: {JSON.stringify(item)}</Text>;

  };



  _share = () => {

    Share.share({

      message: JSON.stringify(this.state.googleResponse.responses),

      title: "Check it out",

      url: this.state.image

    });

  };



  _copyToClipboard = () => {

    Clipboard.setString(this.state.image);

    alert("Copied to clipboard");

  };



  _takePhoto = async () => {

    let pickerResult = await ImagePicker.launchCameraAsync({

      allowsEditing: true,

      aspect: [4, 3]

    });



    this._handleImagePicked(pickerResult);
    this.state.analyze=true;
  };



  _pickImage = async () => {

    let pickerResult = await ImagePicker.launchImageLibraryAsync({

      allowsEditing: true,

      aspect: [4, 3]

    });



    this._handleImagePicked(pickerResult);
    this.state.analyze = true;
  };



  _handleImagePicked = async pickerResult => {

    try {

      this.setState({ uploading: true });



      if (!pickerResult.cancelled) {

        uploadUrl = await uploadImageAsync(pickerResult.uri);

        this.setState({ image: uploadUrl });

      }

    } catch (e) {

      console.log(e);

      alert("Upload failed, sorry :(");

    } finally {

      this.setState({ uploading: false });

    }

  };



  submitToGoogle = async () => {

    try {

      this.setState({ uploading: true });

      let { image } = this.state;

      let body = JSON.stringify({

        requests: [

          {

            features: [
              { type: "DOCUMENT_TEXT_DETECTION"},
            ],

            image: {

              source: {

                imageUri: image

              }

            }



          }

        ]

      });

      let response = await fetch(

        "https://vision.googleapis.com/v1/images:annotate?key=" +

          Environment["GOOGLE_OPTICAL_CHARACTER_RECOGNITION_API_KEY"],

        {

          headers: {

            Accept: "application/json",

            "Content-Type": "application/json"

          },

          method: "POST",

          body: body

        }

      );

      let responseJson = await response.json();

      console.log(responseJson);

      this.setState({

        googleResponse: responseJson,
        analyze: false,
        uploading: false

      });

    } catch (error) {

      console.log(error);

    }

  };

}

function handleHelpPress() {
  WebBrowser.openBrowserAsync(
    'https://adoring-hamilton-81fcfa.netlify.app/' 
  );
}

async function uploadImageAsync(uri) {

  // Why are we using XMLHttpRequest? See:

  // https://github.com/expo/expo/issues/2402#issuecomment-443726662

  const blob = await new Promise((resolve, reject) => {

    const xhr = new XMLHttpRequest();

    xhr.onload = function() {

      resolve(xhr.response);

    };

    xhr.onerror = function(e) {

      console.log(e);

      reject(new TypeError("Network request failed"));

    };

    xhr.responseType = "blob";

    xhr.open("GET", uri, true);

    xhr.send(null);

  });



  const ref = firebase

    .storage()

    .ref()

    .child(uuid.v4());

  const snapshot = await ref.put(blob);



  // We're done with the blob, close and release it

  blob.close();



  return await snapshot.ref.getDownloadURL();

}



const styles = StyleSheet.create({

  container: {

    flex: 1,

    backgroundColor: "#fff",

    paddingBottom: 10

  },

  developmentModeText: {

    marginBottom: 20,

    color: "rgba(0,0,0,0.4)",

    fontSize: 14,

    lineHeight: 19,

    textAlign: "center"

  },

  contentContainer: {

    paddingTop: 0

  },

  welcomeContainer: {

    alignItems: "center",

    marginTop: 0,

    marginBottom: 0

  },

  welcomeImage: {

    width: 200,

    height: 160,

    resizeMode: "contain",

    marginTop: 0,

    marginLeft: -10

  },

  getStartedContainer: {

    alignItems: "center",

    marginHorizontal: 50

  },



  getStartedText: {

    fontSize: 17,

    color: "rgba(96,100,109, 1)",

    lineHeight: 24,

    textAlign: "center"

  },

  button: {
    backgroundColor: 'lightskyblue',
    borderColor: 'black',
    borderWidth: 1,
    borderRadius: 10,
    color: 'white',
    fontSize: 20,
    fontWeight: '400',
    overflow: 'hidden',
    padding: 8,
    textAlign:'center',
  },

  button2: {
    backgroundColor: 'lightsalmon',
    borderColor: 'black',
    borderWidth: 1,
    borderRadius: 10,
    color: 'black',
    fontSize: 20,
    fontWeight: '400',
    overflow: 'hidden',
    padding: 8,
    textAlign:'center',
  },

  button3: {
    backgroundColor: 'lightsalmon',
    borderColor: 'black',
    borderWidth: 1,
    borderRadius: 10,
    color: 'black',
    fontSize: 20,
    fontWeight: '400',
    overflow: 'hidden',
    padding: 8,
    textAlign:'center',
  },

  helpContainer: {

    marginTop: 0,

    alignItems: "center"

  }

});