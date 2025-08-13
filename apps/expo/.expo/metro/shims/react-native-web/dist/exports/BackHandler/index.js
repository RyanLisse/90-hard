function emptyFunction() {}
const BackHandler = {
  exitApp: emptyFunction,
  addEventListener: () => ({ remove: emptyFunction }),
  removeEventListener: emptyFunction,
};
export default BackHandler;
