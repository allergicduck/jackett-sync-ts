function arrayEquals<T>(arr1: T[], arr2: T[]) {
    return arr1.length === arr2.length && !arr1.some((v) => arr2.indexOf(v) < 0) && !arr2.some((v) => arr1.indexOf(v) < 0);
}

export { arrayEquals };