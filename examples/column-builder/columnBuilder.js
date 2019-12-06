export function columnBuilder(nodes) {
    let prevLevel = Number.POSITIVE_INFINITY;

    return flatten(nodes)
        .reduce((acc, node, i) => {

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
                ]
            } else {
                result = [
                    ...acc,
                    newNode
                ]
            };

            prevLevel = level;
            return result;
        }, []);
};

function flatten(nodes, level=1, rowSpan=1) {
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

            return [
                ...acc,
                node,
                ...flatten(columns, level + 1, 1)
            ];

        } else {

            node = {
                level,
                rowSpan,
                colSpan,
                ...node
            };

            return [
                ...acc,
                node
            ];
        }
    }, []);
}


function calculateRowSpan(nodes) {
    let nestedNodes = nodes.filter(c => c.hasOwnProperty('columns'));

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
        }, 0)
    }
}

function isObject(o) {
    return o !== null && typeof o === 'object';
}