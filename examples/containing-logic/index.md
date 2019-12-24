[Back to main contents](../../README.md)

# Containing logic using ContentPlaceholder

Imagine having a component that contains its own logic for loading and editing some kind of data. Sometimes you might need a Button that creates a new entry
and reloads the data. Since it is rendered outside the component, the button has no access to its internal controller methods. To ovrcome this, you might get tempted to place that logic outside the component and pass some additional flag to let it know when it should reload the data.

A better approach is to define the `Button` inside the component and use a `ContentPlaceholder` to render the `Button` outside.
This way we are able to concentrate the logic inside component's controller, but optionally make some operations available in a sibling component.
A common exapmle is to render a "Create new" `Button` inside the `Section` header.

More details and examples soon.
