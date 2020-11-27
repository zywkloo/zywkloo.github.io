---
layout: post
title:  "React-Native-Meteor: FB/Google Login & OAuth"
image: ''
date:   2019-09-05 00:06:31
tags:
- React Native 
- React
- Front End
description: 'Solutions with React-Native-Meteor Social Login'
categories:
- Mobile
- Front End
---

### by Yiwei Zhang

## I. Social login

* Data and verification Flow

||||
----
||||
	


## II. Social login

1.1 Facebook login

 _under_construction_
 
* Android

 _under_construction_
 
* iOS

 _under_construction_
 
1.2 Google login

* Set up

 For the React Native part, we use this package, https://github.com/react-native-google-signin/google-signin
 
 cuz our RN version is `0.59.10`, run `yarn add react-native-google-signin` or `npm install react-native-google-signin`.
 
* Flow
 
 Here we created a `MeteorGoogleLoginManager` to handle everything with Google login on the Mobile (React Native) side, with the help of `MeteorCommunicationManager` Class we created previously for handling the communication with our Meteor Server.
 
 ```
 import { MeteorCommunicationManager } from './'
 
 export default class MeteorGoogleLoginManager {
  static configureGoogleSignIn() {
    GoogleSignin.configure({
      webClientId: ENV_CONFIG.google.webClientId,
      offlineAccess: false
    })
  }
  ...
 }
  
  ```
 
 
 
* Android

 _under_construction_
 
* iOS
 
## III. Meteor server login and second-time OAuth / OAuth2

2.1 [Spencer Carli](https://medium.com/@spencer_carli)'s solution in 2016 with Meteor 1.3 

[Article Link](https://medium.com/differential/react-native-meteor-oauth-with-facebook-3d1346d7cdb7#.kr5f8jorz)


 _under_construction_
 

2.2 [mgscreativa](https://github.com/mgscreativa) 's solution in 2016 with Meteor 1.5.1

[Article Link](https://github.com/inProgress-team/react-native-meteor/issues/278)

It called a method in Meteor module :Accounts.updateOrCreateUserFromExternalService()

 _under_construction_
 

2.3 Offical module with newest Meteor version

[Article Link](https://github.com/meteor/meteor/blob/devel/packages/facebook-oauth/facebook_server.js)

 _under_construction_
 

# IV. React-Native-Meteor credential maintenance with Package AsyncStorage

    const USER_TOKEN_KEY='reactnativemeteor_usertoken'
   
    AsyncStorage.setItem(USER_TOKEN_KEY, ret.token)
    Data._tokenIdSaved = ret.token
    Meteor._userIdSaved = ret.id
    

 _under_construction_
 
