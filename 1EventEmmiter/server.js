const http = require('http');
const fs = require('fs');
const EventEmitter = require('events');

class ShoppingCart extends EventEmitter {
    constructor() {
        super();
        this.items = [];
        this.total = 0;
        
        this.on('itemAdded', (item) => {
            console.log(`Item added: ${item.name} - $${item.price}`);
        });
        
        this.on('itemRemoved', (item) => {
            console.log(`Item removed: ${item.name}`);
        });
        
        this.on('cartCleared', () => {
            console.log('Cart cleared');
        });
        
        this.on('totalUpdated', (total) => {
            console.log(`Total: $${total.toFixed(2)}`);
        });
    }
    
    addItem(item) {
        this.items.push(item);
        this.total += item.price * item.quantity;
        this.emit('itemAdded', item);
        this.emit('totalUpdated', this.total);
        return this.items;
    }
    
    removeItem(itemId) {
        const itemIndex = this.items.findIndex(item => item.id === itemId);
        if (itemIndex !== -1) {
            const removedItem = this.items[itemIndex];
            this.total -= removedItem.price * removedItem.quantity;
            this.items.splice(itemIndex, 1);
            this.emit('itemRemoved', removedItem);
            this.emit('totalUpdated', this.total);
        }
        return this.items;
    }
    
    clearCart() {
        this.items = [];
        this.total = 0;
        this.emit('cartCleared');
        this.emit('totalUpdated', this.total);
        return this.items;
    }
    
    getItems() {
        return this.items;
    }
    
    getTotal() {
        return this.total;
    }
}

const cart = new ShoppingCart();

const server = http.createServer((req, res) => {
    if (req.url === '/' || req.url === '/index.html') {
        fs.readFile('index.html', (err, content) => {
            if (err) {
                res.writeHead(500);
                res.end('Error');
            } else {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(content);
            }
        });
    }
    else if (req.url === '/style.css') {
        fs.readFile('style.css', (err, content) => {
            if (err) {
                res.writeHead(500);
                res.end('Error');
            } else {
                res.writeHead(200, { 'Content-Type': 'text/css' });
                res.end(content);
            }
        });
    }
    else if (req.url === '/api/cart' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            items: cart.getItems(),
            total: cart.getTotal()
        }));
    }
    else if (req.url === '/api/cart/add' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
            const item = JSON.parse(body);
            item.id = Date.now().toString();
            cart.addItem(item);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                items: cart.getItems(),
                total: cart.getTotal()
            }));
        });
    }
    else if (req.url.startsWith('/api/cart/remove/') && req.method === 'DELETE') {
        const itemId = req.url.split('/').pop();
        cart.removeItem(itemId);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            items: cart.getItems(),
            total: cart.getTotal()
        }));
    }
    else if (req.url === '/api/cart/clear' && req.method === 'POST') {
        cart.clearCart();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            items: cart.getItems(),
            total: cart.getTotal()
        }));
    }
    else {
        res.writeHead(404);
        res.end('Not found');
    }
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
    console.log('EventEmitter is active...\n');
});
