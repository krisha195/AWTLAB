const http = require('http');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2');
const EventEmitter = require('events');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'techshop'
});

db.connect(err => {
    if (err) console.log(err);
});

db.query(`CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    password VARCHAR(100),
    created_at DATETIME
)`);

db.query(`CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50),
    user_name VARCHAR(100),
    total DECIMAL(10,2),
    status VARCHAR(20),
    created_at DATETIME
)`);

db.query(`CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(50),
    product_id VARCHAR(50),
    product_name VARCHAR(100),
    price DECIMAL(10,2),
    quantity INT,
    subtotal DECIMAL(10,2)
)`);

class UserManager {
    constructor() {
        this.sessions = new Map();
    }

    register(name, email, password, cb) {
        const id = 'U' + Date.now();
        db.query(
            'INSERT INTO users VALUES (?, ?, ?, ?, ?)',
            [id, name, email, password, new Date()],
            err => {
                if (err) cb({ success: false, message: "Email exists" });
                else cb({ success: true });
            }
        );
    }

    login(email, password, cb) {
        db.query(
            'SELECT * FROM users WHERE email=? AND password=?',
            [email, password],
            (err, results) => {
                if (!results || results.length === 0)
                    cb({ success: false });
                else {
                    const user = results[0];
                    const sid = 'S' + Date.now();
                    this.sessions.set(sid, user.id);
                    cb({
                        success: true,
                        sessionId: sid,
                        user: { id: user.id, name: user.name, email: user.email }
                    });
                }
            }
        );
    }

    getUser(sessionId, cb) {
        const id = this.sessions.get(sessionId);
        if (!id) return cb(null);

        db.query(
            'SELECT id,name,email FROM users WHERE id=?',
            [id],
            (err, results) => {
                cb(results.length ? results[0] : null);
            }
        );
    }

    logout(sessionId) {
        this.sessions.delete(sessionId);
    }
}

class ProductCatalog {
    constructor() {
        this.products = [
            { id:'P001', name:'Laptop', price:75000, description:'High-performance laptop', stock:10 },
            { id:'P002', name:'Phone', price:45000, description:'Latest smartphone', stock:15 },
            { id:'P003', name:'Headphones', price:11000, description:'Wireless headphones', stock:20 },
            { id:'P004', name:'Mouse', price:3500, description:'Ergonomic mouse', stock:30 }
        ];
    }
    getAll(){ return this.products; }
    getById(id){ return this.products.find(p=>p.id===id); }
    updateStock(id,q){
        const p=this.getById(id);
        if(p) p.stock-=q;
    }
}

class Cart {
    constructor(){
        this.items=[];
        this.total=0;
    }
}

const users = new UserManager();
const products = new ProductCatalog();
const carts = new Map();

function getCart(sessionId){
    if(!carts.has(sessionId)) carts.set(sessionId,new Cart());
    return carts.get(sessionId);
}

const server = http.createServer((req,res)=>{

    const sessionId = req.headers['session-id'];

    if(req.url==='/style.css'){
        fs.readFile(path.join(__dirname,'style.css'),(e,d)=>{
            res.writeHead(200,{'Content-Type':'text/css'});
            res.end(d);
        });
        return;
    }

    if(req.url==='/'||req.url==='/index.html'){
        fs.readFile(path.join(__dirname,'index.html'),(e,d)=>{
            res.writeHead(200,{'Content-Type':'text/html'});
            res.end(d);
        });
        return;
    }

    if(req.url==='/api/products'){
        res.writeHead(200,{'Content-Type':'application/json'});
        return res.end(JSON.stringify(products.getAll()));
    }

    if(req.url==='/api/auth/register' && req.method==='POST'){
        let body='';
        req.on('data',c=>body+=c);
        req.on('end',()=>{
            const {name,email,password}=JSON.parse(body);
            users.register(name,email,password,result=>{
                res.writeHead(200,{'Content-Type':'application/json'});
                res.end(JSON.stringify(result));
            });
        });
        return;
    }

    if(req.url==='/api/auth/login' && req.method==='POST'){
        let body='';
        req.on('data',c=>body+=c);
        req.on('end',()=>{
            const {email,password}=JSON.parse(body);
            users.login(email,password,result=>{
                res.writeHead(200,{'Content-Type':'application/json'});
                res.end(JSON.stringify(result));
            });
        });
        return;
    }

    if(req.url==='/api/auth/me'){
        users.getUser(sessionId,user=>{
            if(!user){
                res.writeHead(401);
                return res.end(JSON.stringify({success:false}));
            }
            res.writeHead(200,{'Content-Type':'application/json'});
            res.end(JSON.stringify({success:true,user}));
        });
        return;
    }

    if(req.url==='/api/auth/logout'){
        users.logout(sessionId);
        res.writeHead(200,{'Content-Type':'application/json'});
        res.end(JSON.stringify({success:true}));
        return;
    }

    if(req.url==='/api/cart' && req.method==='GET'){
        const cart=getCart(sessionId);
        res.writeHead(200,{'Content-Type':'application/json'});
        res.end(JSON.stringify(cart));
        return;
    }

    if(req.url==='/api/cart/add' && req.method==='POST'){
        let body='';
        req.on('data',c=>body+=c);
        req.on('end',()=>{
            const {productId,quantity}=JSON.parse(body);
            const product=products.getById(productId);
            const cart=getCart(sessionId);

            const existing=cart.items.find(i=>i.productId===productId);
            if(existing) existing.quantity+=quantity;
            else cart.items.push({
                id:'CI'+Date.now(),
                productId,
                name:product.name,
                price:product.price,
                quantity
            });

            cart.total+=product.price*quantity;

            res.writeHead(200,{'Content-Type':'application/json'});
            res.end(JSON.stringify(cart));
        });
        return;
    }

    if(req.url.startsWith('/api/cart/remove/')){
        const id=req.url.split('/').pop();
        const cart=getCart(sessionId);
        cart.items=cart.items.filter(i=>i.id!==id);
        cart.total=cart.items.reduce((s,i)=>s+i.price*i.quantity,0);

        res.writeHead(200,{'Content-Type':'application/json'});
        res.end(JSON.stringify(cart));
        return;
    }

    if(req.url==='/api/cart/clear'){
        carts.set(sessionId,new Cart());
        res.writeHead(200,{'Content-Type':'application/json'});
        res.end(JSON.stringify(getCart(sessionId)));
        return;
    }

    if(req.url==='/api/orders/checkout'){
        const cart=getCart(sessionId);
        carts.set(sessionId,new Cart());
        res.writeHead(200,{'Content-Type':'application/json'});
        res.end(JSON.stringify({success:true}));
        return;
    }

    res.writeHead(404);
    res.end();
});

server.listen(3001,()=>{
    console.log("Server running at http://localhost:3001");
});
