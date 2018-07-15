# Browser Cancelable Events

Automatically invalidate async listeners and promises in one place.</br>
Lightweight zero dependent library for browsers.

### Motivation

Libraries like React, should invalidate all async tasks once component is unmounted,
using `isMounted` is anti pattern.

## Table of Contents

1. [Quick start](#install)
2. [API](#api)
3. [Testing](#testing)
4. [License](#license)
 

## Quick start

### Install

```shell
npm i --save browser-cancelable-events
```

### Typescript
The project is written with typescript and comes with a built-in `index.d.ts`

#### Import

```javascript
import { CancelableEvents, isCancelledPromiseError } from "browser-cancelable-events";
```

#### Require
```javascript
const { CancelableEvents, isCancelledPromiseError } = require("browser-cancelable-events");
```

### Usage
Usage example using react component

```javascript
import { Component } from 'react'
import { CancelableEvents, isCancelledPromiseError } from "browser-cancelable-events";

class MyComponent extends Component {
    constructor(props) {
        super(props);
        this.cancelable = new CancelableEvents();
    }

    componentDidMount() {
        this.cancelable.addWindowEventListener("resize", this.onWindowResize.bind(this));
        this.cancelable.addDocumentEventListener("keydown", (e) => {
            if (e.shiftKey) {
                // shift clicked
            }
        });
        this.updateEverySecond();
        this.fetchDataFromApi();
    }

    // invalidate all events
    componentWillUnmount() {
        this.cancelable.cancelAll(); // this is the magic line
    }

    render() {
        return (
            <div> ... </div>
        );
    }

    // interval that updates every second
    updateEverySecond() {
        this.cancelable.setInterval(() => {
            this.setState({
                counter: this.state.counter + 1,
            })
        }, 1000);
    }

    // do task with timeout
    doSomeAnimation() {
        this.setState({
            isInAnimation: true,
        }, () => {
            this.cancelable.setTimeout(() => {
                this.setState({
                    isInAnimation: false,
                });
            }, 500);
        })
    }

    // use invalidated promise
    async fetchDataFromApi() {
        try {
            const apiResult = await this.cancelable.promise(() => {
                return APIService.fetchSomeData();
            });

            const someVeryLongPromise = this.cancelable.promise(() => {
                return APIService.fetchSomeReallyLongTask();
            });

            this.cancelable.setTimeout(() => {
                // 1 second is too much, let's cancel
                someVeryLongPromise.cancel();
            }, 1000);

            await someVeryLongPromise;
        } catch (err) {
            if (isCancelledPromiseError(err)) {
                // all good, component is not mounted or promise is cancelled
                return;
            }

            // it's real error, should handle
        }
    }

    // callback for window.addEventListener
    onWindowResize(e) {
        // do something with resize event
    }
}
```
## API

### Cancelable object

Each one of the cancelable methods returns object with cancel method

```javascript
{
    cancel: Function
}
```

```javascript
const timer = cancelable.setInterval(intervalCallback, 100);
timer.cancel();
```

### Timeout

```javascript
cancelable.setTimeout(callback, time, ...args[]) -> CancelableObject
```

### Interval

```javascript
cancelable.setInterval(callback, time, ...args[]) -> CancelableObject
```

### Promise

```javascript
cancelable.promise(functionThatReturnsPromise, ...args[]) -> Promise & CancelableObject
cancelable.promise(promise) -> Promise<T> & CancelableObject
```

##### Promise example

```javascript
const cancelable = new CancelableEvents();

cancelable.promise(new Promise((resolve, reject) => {
    resolve("foo");
})).then((res) => {
    console.log(res); // foo
});

let cancelTimer;
// invalidate promise after 1 second
const promise = cancelable.promise(() => API.fetchSomeLongData());

promise.then((data) => {
    if(cancelTimer){
        cancelTimer.cancel();
    }
}).catch((err) => {
    if(isCancelledPromiseError(err)){
        // timeout, took too long
        return;
    };
    // real error
});

// if promise.cancel() called after fulfilled, nothing will happen
cancelTimer = cancelable.setTimeout(() => {
    promise.cancel();
}, 1000);
```

### Document event listener

Observes `document.addEventListener` 
```javascript
cancelable.addDocumentEventListener(eventKey, callback) -> CancelableObject
```

### Window event listener

Observes `window.addEventListener` 
```javascript
cancelable.addWindowEventListener(eventKey, callback) -> CancelableObject
```

##### Event listeners example

```javascript
const cancelable = new CancelableEvents();

cancelable.addDocumentEventListener("mousewheel", (e) => {
   // do something with event 
});
cancelable.addWindowEventListener("submit", (e) => {
    // do something with event
});

// remove all cancelable listeners
cancelable.cancelAll();
```

### Custom event emitter

You can use custom event emitter with cancelable events.

```javascript
cancelable.addCustomCancelable(subscription, removeKey) -> CancelableObject
```

##### Custom event emitter example

```javascript
const { EventEmitter } = require("fbemitter");

const emitter = new EventEmitter();
// key "remove" because emitter.addListener(...).remove()
cancelable.addCustomCancelable(emitter.addListener("myCustomEvent", callback), "remove");
```
## Testing
```shell
npm run tests
```
## License
MIT