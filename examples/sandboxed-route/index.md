[Back to main contents](../../README.md)

# SandboxedRoute component

Normally when we define a route, we also want to isolate the store so the data does not get mixed with the other routes.
One way would be to use the `PrivateStore` component, but the drawback is that the data is lost as soon as the `PrivateStore` component is destroyed, which basically happens every time the user goes to another route.

To both keep the previously loaded data between renders and isolate it from other routes, the natural choice would be the `Sandbox` component, where we can use the URL itself as a `key` value. The problem arises if we have subroutes that contain some parameters, e.g. `~/user/:userId`. In such cases we would need to nest one `Sandbox` within another.

The parent `Sandbox` could use the keyword `user` as a key, and the nested `Sandbox` could use the `userId`.

This pattern has proved itself useful so many times that we decided to create a simple component called `SandboxedRoute` that, as the name suggests, combines the `Sandbox` and the `Route` components, together with some other useful benefits.

### Example
```jsx
import {Sandbox, Route, Rescope, DataProxy} from 'cx/widgets';
import { isBinding } from 'cx/data';

// prefix data with '$root.'
function prefixData(data={}) {
    let copy = {};
    for (let key in data) {
        let val = data[key];
        copy[key] = isBinding(val)
            ? {
                ...val,
                bind: `$root.${val.bind}`
            }
            : val;
    }
    return copy;
}

export const SandboxedRoute = ({url, data, prefix, route, children, key, storage, recordName="$page"}) => (
    <cx>
        <Route url={url} route={route} prefix={prefix}>
            <Sandbox key={key || url} storage={storage} recordName={recordName}>
                <Rescope bind={recordName}>
                    <DataProxy
                        // prefix data with '$root.'
                        data={prefixData(data)}
                    >
                        {children}
                    </DataProxy>
                </Rescope>
            </Sandbox>
        </Route>
    </cx>
);
```

We are also using `Rescope` to automatically put all children bindings within the `Sandbox`. Finally, `DataProxy` lets us simply propagate selected data from the outer to the inner/nested `Sandbox`.

### Usage
```jsx
<SandboxedRoute
    route="~/user/:userId" 
    prefix
    storage-bind="users"
    recordName="$user"
    key-bind="$route.userId"
    data={{
        url: bind('url'),
        userId: bind('$route.userId')
    }}
>
    <UserDashboard userId-bind="userId" url-bind="url" />
</SandboxedRoute>
```

In the example above, we are propagating `url` and `userId` from parent to nested `Sandbox`.