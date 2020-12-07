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

This articel is not a 100%-original walkthrough, but a derivative design and implementation, inspired by [Spencer Carli](https://medium.com/@spencer_carli) and some other open-source implementations.

All code snippets shown in this article are from public open-source projects. The proprietary part would not be provided here.

* 1.2 Tech Stack

Meteor web tech stack is a very mature web full stack solution. In the Meteor land we're used to luxuries like automatically synced data, or being able to write database queries using the same syntax on the client and server. You maybe have not heard Meteor before, but the successor of Meteor, Apollo, is widely known for the popular GraphQL. It gives you a lot more control, but also requires you to write a lot of this logic yourself.

When it comes to mobile, the maturity might become a problem. As the combo of React-Native-Meteor is quite rare, the 3rd party package [`React-Native-Meteor`](https://www.npmjs.com/package/react-native-meteor), has not been updated for 2 years. On the other hand, It is still the best solution so far, if you don't want to build your own wheel.

The target backend is using `Meteor.Accounts` for user login and authentication as the part of the mature solution, including social login. However, Meteor.Accounts APIs are not availabe on mobile (React Native). So developers need to find a third party package or SDK to finish the FB login and Google login. 

If developers are looking for a 3rd party package to sovle this with serval `yarn` or `npm install`, they may want the __desired package__ to be compatible with front end __React-Native-Meteor__, which this solution heavily leans on, and the back end __Meteor.Accounts__ package at the same time. 

Unfortunately, there was none like this.

[Spencer Carli](https://medium.com/@spencer_carli) was able to implement the facebook login by writing his own facebook login handler. Then for google login, he basically followed his [Github project](https://github.com/spencercarli/meteor-accounts-google-oauth).

Thus, based on Spencer's great work, it's time for developers to refactor their own wheels.

* 1.3 Work Flow: 

Here is the workflow, inspired by [Spencer Carli](https://medium.com/@spencer_carli).

Spencer didn't provide the database CRUD details, because the database and web social login solutions may vary. And he used the default `LoginButton` component provided by Facebook SDK, so we need to create our own custom social login components.


> Legend: 
 > * Red circled: [Spencer Carli](https://medium.com/@spencer_carli)'s design.
 > * The Uncircled: original implementation.
 

![React-Native-Meteor-SocialLogin](https://github.com/zywkloo/myLeetCodePractice/raw/master/pics/Meteor%20Auth%20flow.png)

## II. Social login Back End


* 2.1 Facebook login back end

Here [Spencer Carli](https://medium.com/@spencer_carli) elaborated his flow in these two articles. It's not hard to follow and implement, so links are provided here for record.

[Medium article](https://medium.com/differential/react-native-meteor-oauth-with-facebook-3d1346d7cdb7#.kr5f8jorz)

[Github project](https://github.com/spencercarli/react-native-meteor-accounts)
 
* 2.2 Google login back end

[Github project](https://github.com/spencercarli/meteor-accounts-google-oauth)

* 2.3 Use Accounts methods to stamp and upsert services

Here, Spencer didn't provide the database CRUD details, because the database and web social login solutions may vary. In general, the `Meteor.Accounts` is one of the most widely used packages for social login with Meteor web solution. 

After dismantling the source code of `Meteor.Accounts`, here is the implementation of Meteor server token generation.

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
    
After Facebook/Google Auth succeeded, Meteor.Accounts package's source code came with two methods to upsert the services.resume.loginTokens, in order to make the mobile users get consistent login info as web users.
 
 
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
 import { YourMeteorCommunicationManager } from './'
 
 export default class YourMeteorGoogleLoginManager {
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
   static YourMeteorAuthCallback = (err, res, cbk, failCbk) => {
     if (!err && !!res) {
       //save user id and token
       const Data = Meteor.getData()
       AsyncStorage.setItem(ENV_CONFIG.USER_TOKEN_KEY, res.token)
       Data._tokenIdSaved = res.token
       Meteor._userIdSaved = res.id
       cbk && cbk(res)
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

 
