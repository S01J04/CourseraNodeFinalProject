const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;
const app = express();
var cookieParser = require('cookie-parser')

const Secret="hello"
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended:false}))
app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

app.use("/customer/auth/*",async function auth(req,res,next){
//Write the authenication mechanism here
const user=await jwt.verify(req.cookies.user,Secret)
req.user=user
console.log(user)
next()
});
 
const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
