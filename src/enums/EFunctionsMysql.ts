export enum EModeWhere {
    strict,
    like,
    dif,
    higher,
    higherEqual,
    less,
    lessEqual
}

export enum EConcatWhere {
    and,
    or,
    none
}

export enum ESelectFunctions {
    count = 'COUNT',
    all = '*',
    sum = 'SUM',
    max = 'MAX',
    prepAlias = 'AS'
}

export enum ETypesJoin {
    left = "LEFT",
    right = "RIGHT",
    none = "INNER"
}