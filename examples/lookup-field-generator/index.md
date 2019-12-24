[Back to main contents](../../README.md)

# lookupFieldGenerator function

`lookupFieldGenerator` is used to encapsulate logic for loading `LookupField` options.
We define only the value binding, and the components loads the options in its private store.
Field is disabled with loading icon while the options are loading.
Additionaly we can use it to add logic for loading other bound values (custom bindings) based on selection id (onLoad).
`lookupFieldGenerator` accepts a function that creates the config for the `LookupField` based on the props passed to the component:
`(props: object) => object`

 ### Usage
```js
export const UserSearch = lookupFieldGenerator(({userRoles, ...props}) => ({
    style: "width: 100%",
    optionTextField: "user_ident",
    loadOptions: () => getEmployeesByRole(userRoles),
    ...props
}));
```

More examples soon...

### `lookupFieldGenerator.js`
```js
import { bind, computable, Controller, createFunctionalComponent, tpl } from 'cx/ui';
import { isFunction, parseStyle } from "cx/util";
import { Icon, LabeledContainer, LookupField, Restate } from 'cx/widgets';
import { pruneUndefinedKeys } from "../../util/pruneUndefinedKeys";

export const lookupFieldGenerator = (configurator) => createFunctionalComponent(({visible=true, ...props}) => {

    let config = isFunction(configurator) ? configurator(props) : { ...configurator, ...props };

    let {
        mod,
        style,
        loading,
        onError,
        records,
        options,
        values,
        value,
        text,
        disabled,
        onQuery,
        loadOptions,
        data,
        onLoad,
        icon,
        label,
        autoFocus,
        viewMode,
        tooltip,
        textTpl, // Template that will use lookup field's internal store bindings to display user friendly selection text
        ...rest
    } = config;

    if (onQuery) throw Error("'onQuery' is not used in lookupFieldGenerator. Use 'loadOptions' instead.")

    props = rest;

    style = {
        verticalAlign: "middle",
        ...parseStyle(style),
    };

    props = {
        style,
        autoFocus,
        ...props
    };


    let WidgetController = class extends Controller {
        async onInit() {
            this.addComputable("computedDisabled", ["disabled", "loading"], (disabled, loading) => {
                return disabled === true ? disabled : (loading && !autoFocus);
            });
            this.addComputable("computedIcon", ["icon", "loading"], (icon, loading) => {
                return loading ? "loading" : (icon || null);
            });
            await this.loadOptions();
            if (onLoad) {
                this.addTrigger("onLoad", ["value", "options"], async (value, options) => {
                    // value and options are loaded async, so we need to wait for both before running onLoad
                    if (!value || !options) return;
                    onLoad(this.store);
                }, true);
            }
        }

        async loadOptions() {
            if (!loadOptions) console.error("loadOptions is not defined");
            this.store.set("loading", true);

            try {
                let data;
                if (typeof loadOptions === "function")
                    data = await loadOptions(this.store);
                else if (typeof loadOptions === "string")
                    data = await this.invokeParentMethod(loadOptions, this.store);

                this.store.set("options", data);
                return data;
            }
            catch(err) {
                console.error(err);
                if (typeof onError === "function")
                    onError(err);
                else if (typeof onError === "string")
                    this.invokeParentMethod(onError, err);
            }
            finally {
                this.store.set("loading", false);
            }
        }
    }

    props = {
        options: bind("options"),
        icon: bind("computedIcon"),
        disabled: bind("computedDisabled"),
        viewMode: bind("viewMode"),
        mod: bind("mod"),
        tooltip: tooltip ? bind("tooltip") : null,
        ...props
    }

    if (values)
        props = {
            values: bind("values"),
            multiple: true,
            ...props
        }
    else {
        props.value = bind("value");
    }

    if (text)
        props.text = text.tpl ? text : bind("text");

    // used only in combination with bindings
    if (textTpl)
        props.text = tpl(textTpl);

    return (
        <cx>
            <LabeledContainer label={label} visible={visible} mod={mod} asterisk={props.asterisk} disabled={disabled}>
                <Restate
                    controller={WidgetController}
                    data={pruneUndefinedKeys({
                        records,
                        value,
                        values,
                        text,
                        loading,
                        disabled,
                        options,
                        viewMode,
                        mod,
                        tooltip,
                        icon,
                        ...data
                    })}
                >
                    <Icon name="loading" visible={computable("loading", "viewMode", (loading, viewMode) => viewMode ? loading : false)} />
                    <LookupField
                        visible={computable("loading", "viewMode", (loading, viewMode) => viewMode ? !loading : true)}
                        {...props}
                    />
                </Restate>
            </LabeledContainer>
        </cx>
    );
});
```