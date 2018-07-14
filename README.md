# browser-cancelable-events

Browser cancelable async events that invalidates them all once

## Table of Contents

1. [Quick start](#install)
2. [API](#api)
3. [Dependencies](#dependencies)
4. [Testing](#testing)
5. [License](#license)
6. [Contact](#contact)
 

## Quick start

### Install

```shell
npm i --save browser-cancelable-events
```

### Import

```javascript
import { CancelableEvents, isCancelledPromiseError } from "browser-cancelable-events";
```

### Require
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

#### Interval
```javascript
cancelable.setInterval(callback, time, ...args[]) -> CancelableObject
```

## Dependencies

## Testing

## License
MIT