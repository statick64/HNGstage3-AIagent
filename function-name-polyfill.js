// This modifies Function.prototype to make function names configurable
// It needs to be loaded before any other code
Object.defineProperty(Function.prototype, 'name', {
  configurable: true,
  writable: true,
  value: Function.prototype.name
});
console.log('✅ Function name polyfill applied');
