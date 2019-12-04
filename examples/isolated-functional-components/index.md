[Back to main contents](../../README.md)

# Functional components with isolated Store

As long as it's used wisely, global Cx Store can be really practical. But if we are trying to create stand-alone components that can be easily used anywhere
without worrying about the string bindings and global store polution, we need a way to isolate them and control their access to global/parent store.

This is where isolated functional components come in handy.

### Example
```jsx
const UserInfo = createFunctionalComponent(({userId}) => {
    return (
        <cx>
            <PrivateStore
                data={{
                    userId
                }}
                controller={{
                    onInit() {
                        this.addTrigger('loadUserData', ['userId'], () => this.loadData(), true);
                    },
                    async loadData() {
                        let userId = this.store.get('userId');
                        if (!userId) return;

                        // load user data from the server...
                    }
                }}
            >
                {/* User info view logic... */}
            </PrivateStore>
        </cx>
    )
});
```
### Usage
```
<UserInfo userId-bind="userId" />
```

In the example above, we are passing the `userId` to the `UserInfo` component. Within the component we are using `PrivateStore` to isolate it from the parent/global store. This way we can use the component anywhere without worrying about its internal string bindings and global store polution.
Note that we are adding a trigger to make sure the data is reloaded on every `userId` change.