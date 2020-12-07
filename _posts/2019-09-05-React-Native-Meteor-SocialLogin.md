---
layout: post
title:  "FB/Google Login:A Solution w/ React-Native-Meteor"
image: ''
date:   2020-09-05 00:06:31
tags:
- React Native 
- React
- Front End
description: 'A solution example with React-Native-Meteor SNS Login'
categories:
- Mobile
- Front End
---

### by Yiwei Zhang

## I. Intro

* 1.1 Disclaimer

This articel is not an orignal walkthrough, but as a summary of references, based on open-source project implementations and the others' great work.

The target backend is using Meteor.Accounts for user login and authentication, including social login. However, it's not likely to call Meteor.Accounts API on React Native. So developers need to find a third party package or SDK to finish the FB login and Google login. The desired package should be compatible with front end React-Native-Meteor, which this solution heavily leans on, and the back end Meteor's Accounts package at the same time. Unfortunately, there was none like this.

Luckily, [Spencer Carli](https://medium.com/@spencer_carli) was able to implement the facebook login by writing our own facebook login handler. Then for google login, he basically followed his [Github project](https://github.com/spencercarli/meteor-accounts-google-oauth).

* 1.2 Workd Flow: 

Here is the workflow of this workflow, inspired by [Spencer Carli](https://medium.com/@spencer_carli), and integrated with the existing project.

> Legend: 
 > * Red circled: [Spencer Carli](https://medium.com/@spencer_carli)'s design.
 > * The Uncircled: original implementation.
 

![React-Native-Meteor-SocialLogin](https://github.com/zywkloo/zywkloo.github.io/raw/master/assets/img/sharding-gerenciamento-usuarios/Meteor%20Auth%20flow.png)

## II. Social login Back End


* 2.1 Facebook login back end

Here [Spencer Carli](https://medium.com/@spencer_carli) elaborated his flow in these two articles. It's not hard to follow and implement, so links are provided here for record.

[Medium article](https://medium.com/differential/react-native-meteor-oauth-with-facebook-3d1346d7cdb7#.kr5f8jorz)

[Github project](https://github.com/spencercarli/react-native-meteor-accounts)
 
* 2.2 Google login back end

[Github project](https://github.com/spencercarli/meteor-accounts-google-oauth)

* 2.3 Use Accounts methods to stamp and upsert services

After dismantling the source code the Meteor.Accounts, here is the implementation of Meteor Account token generation.

```
  Accounts.registerLoginHandler('facebookMobile', ({ options }) => {
  //*** Auth part
    const stampedToken = Accounts._generateStampedLoginToken()
    const hashStampedToken = Accounts._hashStampedToken(stampedToken)
    Meteor.users.update(userId, {
      $push: { 'services.resume.loginTokens': hashStampedToken }
    })
    return {
      _id: userId,
      userId: userId,
      token: stampedToken.token
   }
  }
 ```
    
After FB/Google Auth succeeded, Meteor.Accounts package's source code came with two methods to upsert the services.resume.loginTokens, in order to make the mobile users get consistent login info as web users.
 
 
# III.  Social Login Front End

* 3.1 Set up

 For the React Native part, it's recommended to use these packages:
 ```
  "react-native-google-signin": "^2.0.0",  // for RN 0.60+ , try @react-native-community/google-signin
  "react-native-fbsdk": "^0.10.1",  //or RN 0.60+, try react-native-fbsdk 1.0+
 ``` 

  Google [react-native-google-signin](https://github.com/react-native-google-signin/google-signin)
  Facebook [react-native-fbsdk](https://github.com/facebook/react-native-fbsdk)
  
* 3.2 Several critical steps
 
 Here Spencer created a `MeteorGoogleLoginManager` to handle everything with Google login on the Mobile (React Native) side, with the help of `MeteorCommunicationManager` Class created previously for handling the communication with our Meteor Server.
 
 Step 1: configure service in order to get token from google/facebook auth services via  mobile SDK.
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
  
 The Last Step: store the Id and Meteor generated token in AsyncStorage and local Metoer Object respectively.
 
   ```
   //Same for google/facebook login
   static meteorAuthCallback = (err, ret, successCbk, failCbk) => {
     if (!err && !!ret) {
       //save user id and token
       const Data = Meteor.getData()
       AsyncStorage.setItem(ENV_CONFIG.USER_TOKEN_KEY, ret.token)
       Data._tokenIdSaved = ret.token
       Meteor._userIdSaved = ret.id
       successCbk && successCbk(ret)
     } else {
       AsyncStorage.removeItem(ENV_CONFIG.USER_TOKEN_KEY)
       failCbk && failCbk(err)
     }
   }
    
```
 
## References

1 [Spencer Carli](https://medium.com/@spencer_carli)'s solution in 2016 with Meteor 1.3 

[Article Link](https://medium.com/differential/react-native-meteor-oauth-with-facebook-3d1346d7cdb7#.kr5f8jorz)

 

2 [mgscreativa](https://github.com/mgscreativa) 's solution in 2016 with Meteor 1.5.1

[Article Link](https://github.com/inProgress-team/react-native-meteor/issues/278)

 

3 Offical module with newest Meteor version

[Article Link](https://github.com/meteor/meteor/blob/devel/packages/facebook-oauth/facebook_server.js)

 
