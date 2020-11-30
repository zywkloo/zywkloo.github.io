---
layout: post
title:  "Lessons Taught w/ React-Part 1:Improve Performance"
image: 'https://github.com/zywkloo/myLeetCodePractice/raw/master/pics/2019Git.png'
date:   2020-11-20 00:06:31
tags:
- React
description: 'Lessons learnt when using React '
categories:
- Front End
---
	
 by Yiwei

 Feel free to add more

## 1. Be careful with states/props checks of unknown types/structures in shouldComponentUpdate or hooks.

It is recommended to pick the correct JavaScript package for states/props comparisons.

Many people prefer vanilla JavaScript methods, simply because they are faster. At least, cliché but true, don’t use === or == to compare states or props, even if you are CONFIDENT that the current data types of states/props used in this component are primitive enough. Next time, when someone in your team adds a new complex state value, the component would behave unlike what you expected.

### Big No:
```
shouldComponentUpdate(nextProps, nextState) {
#.... some props checks
    for (let key of Object.keys(this.state)) {
        if (nextState[key] !== this.state[key]) return true
    }
#.... some other checks
    return false
}
```
### Maybe Yes:
Here you can replace Object.keys(this.state) with a custom key set /array you designated like the keysToBeChecked below:
```
const keysToBeChecked = ['localAudioLv','localVideoLv' ,'RemoteVideoLv' ]
import { isEqual } from ‘lodash’
shouldComponentUpdate(nextProps, nextState) {
#.... some props checks
# here you can replace the Objects.keys(this.state) with the array `keysToBeChecked`
    for (let key of Object.keys(this.state)) {
        if (!isEqual(nextState[key], this.state[key])) return true
    }
#.... some other checks
    return false
}
```
If you don’t like Lodash.jsuse other packages like Underscore.js, Immutable.js. if you are not sure which to use, ask your teammate or leader.
Note: Since Lodash.js is derived from Underscore.js , so in general, it’s a better option if you need not only a comparison. However, React officially to recommend Immutable.js.



## 2.  Better setState({}) only when necessary
Technically re-setState the same value in states, won't re-render the native(non-virtual) DOM 
(if I'm wrong, please correct me).
But many states may be passed to the children as their props, which would be a problem. That leads to unnecessary re-rendering.
   
### No good:
  ```
//no checks  
this.setState({ userAudioMap })
   ```
		   
### Better:    
  ```
import { isEqual } from 'lodash' 
...

!isEqual(userAudioMap, this.state.userAudioMap) && this.setState({ userAudioMap })
```

 _or_
  
```
import { isEqual } from 'lodash' 
// better readability
if(!isEqual(userAudioMap, this.state.userAudioMap)){
	this.setState({ userAudioMap }) 
}
 ```

## 3. Aware of state types when using React.PureComponent

React.PureComponent’s shouldComponentUpdate() only shallowly compares the objects.
	
Only extend PureComponent when you expect to have simple props and state, Or, consider using immutable.js (recommended by React) objects to facilitate fast comparisons of nested data.


### Pros:
* Dev don't have to use shouldComponentUpdate explicitly for performance improvement.

### Cons:	
* Due to shallowEquals, it won't compare values in deeper value, so page may not be updated when needed.
* Need to make sure the states are primitive types or "simple" enough.




