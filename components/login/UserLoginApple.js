import {
  Alert,

} from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';

export default UserLoginApple = async function (){
  try {
    let response = {};
    let appleId = '';
    let appleToken = '';
    if (Platform.OS === 'ios') {
      // Performs login request requesting user email
      response = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.EMAIL],
      });
      // On iOS, user ID and email are easily retrieved from request
      appleId = response.user;
      appleToken = response.identityToken;
    } else if (Platform.OS === 'android') {
      // Configure the request
      appleAuthAndroid.configure({
        // The Service ID you registered with Apple
        clientId: 'YOUR_SERVICE_ID',
        // Return URL added to your Apple dev console
        redirectUri: 'YOUR_REDIRECT_URL',
        responseType: appleAuthAndroid.ResponseType.ALL,
        scope: appleAuthAndroid.Scope.ALL,
      });
      response = await appleAuthAndroid.signIn();
      // Decode user ID and email from token returned from Apple,
      // this is a common workaround for Apple sign-in via web API
      const decodedIdToken = jwt_decode(response.id_token);
      appleId = decodedIdToken.sub;
      appleToken = response.id_token;
    }
    // Format authData to provide correctly for Apple linkWith on Parse
    const authData = {
      id: appleId,
      token: appleToken,
    };
    let currentUser = await Parse.User.currentAsync();
    // Link user with his Apple Credentials
    return await currentUser
      .linkWith('apple', {
        authData: authData,
      })
      .then(async (loggedInUser) => {
        // logIn returns the corresponding ParseUser object
        Alert.alert(
          'Success!',
          `User ${loggedInUser.get(
            'username',
          )} has successfully linked his Apple account!`,
        );
        // To verify that this is in fact the current user, currentAsync can be used
        currentUser = await Parse.User.currentAsync();
        console.log(loggedInUser === currentUser);
        return true;
      })
      .catch(async (error) => {
        // Error can be caused by wrong parameters or lack of Internet connection
        Alert.alert('Error!', error.message);
        return false;
      });
  } catch (error) {
    // Error can be caused by wrong parameters or lack of Internet connection
    Alert.alert('Error!', error);
    return false;
  }
};