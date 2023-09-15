import {GoogleSignin} from '@react-native-community/google-signin';

GoogleSignin.configure({
  iosClientId:
    'GOOGLE_IOS_CLIENT_ID',
  webClientId:
    'GOOGLE_ANDROID_WEB_CLIENT_ID',
});

export default UserLoginGoogle = async function () {
  try {
    // Check if your user can sign in using Google on his phone
    await GoogleSignin.hasPlayServices({showPlayServicesUpdateDialog: true});
    // Retrieve user data from Google
    const userInfo = await GoogleSignin.signIn();
    const googleIdToken = userInfo.idToken;
    const googleUserId = userInfo.user.id;
    const googleEmail = userInfo.user.email;
    // Log in on Parse using this Google id token
    const userToLogin = new Parse.User();
    // Set username and email to match google email
    userToLogin.set('username', googleEmail);
    userToLogin.set('email', googleEmail);
    return await user
      .linkWith('google', {
        authData: {id: googleUserId, id_token: googleIdToken},
      })
      .then(async (loggedInUser) => {
        // logIn returns the corresponding ParseUser object
        Alert.alert(
          'Success!',
          `User ${loggedInUser.get('username')} has successfully signed in!`,
        );
        // To verify that this is in fact the current user, currentAsync can be used
        const currentUser = await Parse.User.currentAsync();
        console.log(loggedInUser === currentUser);
        // Navigation.navigate takes the user to the screen named after the one
        // passed as parameter
        navigation.navigate('Home');
        return true;
      })
      .catch(async (error) => {
        // Error can be caused by wrong parameters or lack of Internet connection
        Alert.alert('Error!', error.message);
        return false;
      });
  } catch (error) {
    Alert.alert('Error!', error.code);
    return false;
  }
};
