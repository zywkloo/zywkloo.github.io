---
layout: post
title:  "React-Native-Meteor:Investigations on Social Media Login & OAuth"
image: ''
date:   2019-09-05 00:06:31
tags:
- React Native 
- Dev
description: 'Solutions with React-Native-Meteor Social Login'
categories:
- Mobile
---

### by Yiwei Zhang

## I. Social login

#1.1 Facebook login
*Data and verification Flow

*Android

*iOS

#1.2 Google login
*Data and verification Flow

*Android

*iOS
 
## II. Meteor server login and second-time OAuth(or OAuth2

#2.1 [Spencer Carli](https://medium.com/@spencer_carli)'s solution in 2016 with Meteor 1.3 

[Article Link](https://medium.com/differential/react-native-meteor-oauth-with-facebook-3d1346d7cdb7#.kr5f8jorz)

#2.2 [mgscreativa](https://github.com/mgscreativa) 's solution in 2016 with Meteor 1.5.1

[Article Link](https://github.com/inProgress-team/react-native-meteor/issues/278)

It called a method in Meteor module :Accounts.updateOrCreateUserFromExternalService()

#2.3 Offical module with newest Meteor version

[Article Link](https://github.com/meteor/meteor/blob/devel/packages/facebook-oauth/facebook_server.js)
