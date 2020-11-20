---
layout: post
title:  "Lessons taught when using React"
image: 'https://github.com/zywkloo/myLeetCodePractice/raw/master/pics/2019Git.png'
date:   2020-11-20 00:06:31
tags:
- React
description: 'Lessons learnt when using React '
categories:
- Front end
---

 # Lessons taught when using React

 Feel free to add more

## 1. NEVER use !== or != to compare JavaScript objects:

### Big NO NO :  
  ```
	    //unless the you are sure every state is immutable or primitive data type
	    for (let key of Object.keys(this.state)) {
	      if (nextState[key] !== this.state[key]) {
	        return true
	      }
	    }
  ```

### Yes:
```
		import { isEqual } from 'lodash' 

		//or other packages like 'Underscore', if you are not sure which to use, ask Matt.

		for (let key of Object.keys(this.state)) {
			if (!isEqual(nextState[key], this.state[key])) {
				return true
			 }
		}
```

## 2.  Better setState({}) only when necessary
   
### No good:
  ```
		//no checks  
		this.setState({ userAudioMap })
		
		//Technically re-setState the same value in states, won't re-render the native(non-virtual) DOM 
		//(if I'm wrong, plz correct Yiwei).
		//But many states may be passed to the children as their props, which would be a problem 
		//That leads to unnecessary re-rendering
   ```
		   
 ### Better:    
  ```
		import { isEqual } from 'lodash' 

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
  ```
	    Dev don't have to use shouldComponentUpdate explicitly for performance improvement.
```
### Cons:	
  ```
      Due to shallowEquals, it won't compare values in deeper value, so page may not be updated when needed.
      Need to make sure the states are primitive types or "simple" enough.
   ```




