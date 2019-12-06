[Back to main contents](../../README.md)

# columnBuilder utility

Complex column headers in Cx grids are really tricky to define, since the configuration syntax adheres to the HTML standard that supports overlapping columns (like bricks in a wall) via the `colSpan` property. While it does offer a lot of flexibility, for most use-cases it is unnecessary and introduces a lot of complexity when defining predominantly parent-child relationship between header levels. Additionaly, if the columns are dynamic (can be re-arranged), their configuration becomes impossible.

For that purpose, we've createad a utility funciton that takes a simple JSON tree structure containing the column configuration (and at the same time defines parent-child relationships between header levels) and outputs the config that the Cx `Grid` expects.

### Usage

```js
columnBuilder([
  {
    header: "Header1",
    field: "email",
    sortable: true
  },
  {
    header: "Flows",
    align: "center",
    columns: [
      {
        header: "Distributions",
        field: "dist",
        sortable: true
      },
      {
        header: "Cash",
        align: "center",
        columns: [
          {
            header: "Deposits",
            field: "phone"
          },
          {
            header: "Withdrawals",
            field: "withdrawals"
          }
        ]
      }
    ]
  }
]);

// output:
[
    {
        header1: { text: "Header1", colSpan: 1, rowSpan: 3, align: undefined },
        field: "email",
        sortable: true,
        align: undefined
    },
    {
        header1: {
            text: "Flows",
            colSpan: 3,
            align: "center",
            allowSorting: false
        },
        align: undefined,
        header2: {
            text: "Distributions",
            colSpan: 1,
            rowSpan: 2,
            align: undefined,
            allowSorting: true
        },
        field: "dist",
        sortable: true
    },
    {
        header2: { text: "Cash", colSpan: 2, align: "center", allowSorting: false },
        align: undefined,
        header3: {
            text: "Deposits",
            colSpan: 1,
            rowSpan: 1,
            align: undefined,
            allowSorting: false
        },
        field: "phone"
    },
    {
        header3: { text: "Withdrawals", colSpan: 1, rowSpan: 1, align: undefined },
        field: "withdrawals",
        align: undefined
    }
];
```

### `columnBuilder.js`
```js
export function columnBuilder(nodes) {
  let prevLevel = Number.POSITIVE_INFINITY;

  return flatten(nodes).reduce((acc, node, i) => {
    let { level, header, colSpan, rowSpan, align, ...rest } = node;

    let newNode = {
      [`header${level}`]: {
        ...(isObject(header) ? header : { text: header }),
        colSpan,
        rowSpan,
        align
      },
      ...rest,
      align
    };

    let result;

    if (level > prevLevel) {
      prevLevel = level;

      let prevNode = acc.pop();
      delete prevNode[`header${level - 1}`].rowSpan;

      prevNode[`header${level - 1}`].allowSorting = false;
      newNode[`header${level}`].allowSorting = Boolean(newNode.sortable);

      result = [
        ...acc,
        {
          ...prevNode,
          ...newNode,
          align
        }
      ];
    } else {
      result = [...acc, newNode];
    }

    prevLevel = level;
    return result;
  }, []);
}

function flatten(nodes, level = 1, rowSpan = 1) {
  rowSpan = Math.max(rowSpan, calculateRowSpan(nodes));

  return nodes.reduce((acc, node) => {
    let colSpan = calculateColSpan(node);

    if (node.hasOwnProperty("columns")) {
      let { columns, ...rest } = node;

      node = {
        level,
        rowSpan,
        colSpan,
        ...rest
      };

      return [...acc, node, ...flatten(columns, level + 1, 1)];
    } else {
      node = {
        level,
        rowSpan,
        colSpan,
        ...node
      };

      return [...acc, node];
    }
  }, []);
}

function calculateRowSpan(nodes) {
  let nestedNodes = nodes.filter(c => c.hasOwnProperty("columns"));

  return nestedNodes.length > 0
    ? nestedNodes
        .map(node => calculateRowSpan(node.columns) + 1)
        .reduce((a, b) => Math.max(a, b))
    : 1;
}

function calculateColSpan(node) {
  if (!node.hasOwnProperty("columns")) {
    return 1;
  } else {
    return node.columns.reduce((colSpan, node) => {
      return colSpan + calculateColSpan(node);
    }, 0);
  }
}

function isObject(o) {
   return o !== null && typeof o === 'object';
}
```