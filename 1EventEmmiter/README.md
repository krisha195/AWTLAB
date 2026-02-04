# Simple Shopping Cart - EventEmitter Learning

A minimal shopping cart to learn Node.js EventEmitter.

## EventEmitter Basics

This project shows how EventEmitter works:

1. **Create a class** that extends EventEmitter
2. **Define events** in the constructor with `.on()`
3. **Emit events** using `.emit()` when actions happen

## Events Used

- `itemAdded` - When product is added
- `itemRemoved` - When product is removed
- `cartCleared` - When cart is cleared
- `totalUpdated` - When total changes

## Files

- `server.js` - Node.js backend with EventEmitter
- `index.html` - Simple frontend
- `style.css` - Basic styling

## How to Run

1. Run: `node server.js`
2. Open: `http://localhost:3000`
3. Watch the console for EventEmitter logs

## Learning Points

- EventEmitter extends your class
- Use `.on(eventName, callback)` to listen
- Use `.emit(eventName, data)` to trigger
- Multiple listeners can listen to same event
- Events help decouple code

Try adding your own events!
