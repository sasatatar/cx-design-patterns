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
                        // add $route binding and prefix data with '$root.'
                        data={prefixData({
                            $route: { bind: '$route' },
                            ...data
                        })}
                    >
                        {children}
                    </DataProxy>
                </Rescope>
            </Sandbox>
        </Route>
    </cx>
);
