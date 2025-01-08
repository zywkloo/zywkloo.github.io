---
layout: post
title:  "FB/Google Login: A Solution with React-Native-Meteor"
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

## I. Introduction

* 1.1 Disclaimer

This article is not a 100%-original walkthrough but a derivative design and implementation inspired by Spencer Carli and other open-source implementations.

All code snippets shown in this article are from public open-source projects. The proprietary part will not be provided here.

* 1.2 Tech Stack

The Meteor web tech stack is a mature web full-stack solution. In the Meteor land, we're used to luxuries like automatically synced data or being able to write database queries using the same syntax on the client and server. You may not have heard of Meteor before, but its successor, Apollo, is widely known for the popular GraphQL. It gives you more control but also requires writing more logic yourself.

When it comes to mobile, the maturity might become a problem. As the combo of React-Native-Meteor is quite rare, the 3rd party package `React-Native-Meteor` has not been updated for 2 years. On the other hand, it's still the best solution so far if you don't want to build your own wheel.

The target backend uses `Meteor.Accounts` for user login and authentication as part of the mature solution, including social login. However, `Meteor.Accounts` APIs are not available on mobile (React Native). So, developers need to find a third-party package or SDK to finish the FB login and Google login.

If developers are looking for a 3rd party package to solve this with `yarn` or `npm install`, they may want the desired package to be compatible with the frontend `React-Native-Meteor` and the backend `Meteor.Accounts` package at the same time.

Unfortunately, there was none like this.

Spencer Carli was able to implement the Facebook login by writing his own Facebook login handler. Then, for Google login, he basically followed his GitHub project.

Thus, based on Spencer's great work, it's time for developers to refactor their own wheels.

* 1.3 Workflow

Here is the workflow, inspired by Spencer Carli.

Spencer didn't provide the database CRUD details because the database and web social login solutions may vary. He used the default `LoginButton` component provided by the Facebook SDK, so we need to create our own custom social login components.

> Legend:
> * Red circled: Spencer Carli's design.
> * The Uncircled: original implementation.

![Meteor Auth flow](https://github.com/user-attachments/assets/0267e659-fc51-4293-8ef2-890ae24bab49)

## II. Social Login Backend

* 2.1 Facebook Login Backend

Here, Spencer Carli elaborated his flow in these two articles. It's not hard to follow and implement, so links are provided here for records.

[Medium article](https://medium.com/differential/react-native-meteor-oauth-with-facebook-3d1346d7cdb7#.kr5f8jorz)

[Github project](https://github.com/spencercarli/react-native-meteor-accounts)

* 2.2 Google Login Backend

[Github project](https://github.com/spencercarli/meteor-accounts-google-oauth)

* 2.3 Use Accounts Methods to Stamp and Upsert Services

Here, Spencer didn't provide the database CRUD details because the database and web social login solutions may vary. In general, `Meteor.Accounts` is one of the most widely used packages for social login with the Meteor web solution.

After dismantling the source code of `Meteor.Accounts`, here is the implementation of Meteor server token generation.

```javascript
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
})
```

After Facebook/Google Auth succeeded, the `Meteor.Accounts` package's source code came with two methods to upsert the `services.resume.loginTokens`, in order to make the mobile users get consistent login info as web users.

## III. Social Login Frontend

* 3.1 Set Up

For the React Native part, it's recommended to use these packages:

```javascript
"react-native-google-signin": "^2.0.0",  // for RN 0.60+ , try @react-native-community/google-signin
"react-native-fbsdk": "^0.10.1",  //or RN 0.60+, try react-native-fbsdk 1.0+
```

Google [react-native-google-signin](https://github.com/react-native-google-signin/google-signin)
Facebook [react-native-fbsdk](https://github.com/facebook/react-native-fbsdk)

* 3.2 Several Critical Steps

Here, Spencer created a `MeteorGoogleLoginManager` to handle everything with Google login on the Mobile (React Native) side, with the help of the `MeteorCommunicationManager` Class created previously for handling the communication with our Meteor Server.

Step 1: Configure the service to get the token from Google/Facebook auth services via the mobile SDK.

```javascript
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

The last step: Store the ID and Meteor-generated token in AsyncStorage and the local Meteor object, respectively.

```javascript
// Same for Google/Facebook login
static YourMeteorAuthCallback = (err, res, cbk, failCbk) => {
  if (!err && !!res) {
    // Save user ID and token
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

1. Spencer Carli's solution in 2016 with Meteor 1.3

[Article Link](https://medium.com/differential/react-native-meteor-oauth-with-facebook-3d1346d7cdb7#.kr5f8jorz)

2. mgscreativa's solution in 2016 with Meteor 1.5.1

[Article Link](https://github.com/inProgress-team/react-native-meteor/issues/278)

3. Official module with the newest Meteor version

[Article Link](https://github.com/meteor/meteor/blob/devel/packages/facebook-oauth/facebook_server.js)
