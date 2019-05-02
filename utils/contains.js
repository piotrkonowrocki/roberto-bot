module.exports = (str, check) => {
    return check.some(item => str.includes(item));
};