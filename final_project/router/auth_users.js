const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();
const path=require('path')
const fs=require('fs')
const bcrypt=require('bcryptjs')
const dataFilePath = path.join(__dirname, 'booksdb.js');
const Secret="hello"
// Read and parse existing data from file
let myObject;
try {
  myObject = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
} catch (err) {
  console.error("Error reading or parsing data.json:", err);
  myObject = { users: [] }; // Initialize with an empty users array if error occurs
}
let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
}



//only registered users can login
regd_users.post("/login", async(req,res) => {
  //Write your code here
  const {username,password}=req.body
  if(!username||!password)
    return res.status(300).json({message: "Empty feilds"});
  const user=myObject.users.find(user=> user.username==username)
  if(!user){
    return res.status(300).json({message: "Invalid User plz try again"});

  }
   const hashedPassword=await bcrypt.compare(password, user.password);
   if(hashedPassword){
    const tokken= await jwt.sign({username},Secret)
    // Respond with the token
    return res.status(200).cookie("user",tokken).json({ message: "Login successful", tokken });
   }
  return res.status(300).json({message: "Yet to be implemented"});
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn; // Extract ISBN
  const review = req.body.review; // Extract review content

  const username = req.user // Get the current user's username

  if (!isbn || !review || !username) {
    return res.status(400).json({ message: "ISBN, review, and username are required" });
  }

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Ensure reviews is an object
  books[isbn].reviews = books[isbn].reviews || {};

  // Use username as the key to ensure reviews by the same user overwrite
  books[isbn].reviews[username.username] = review;

  // Write the updated books object back to the file
  fs.writeFile(dataFilePath, `let books = ${JSON.stringify(books, null, 2)};\n\nmodule.exports = books;`, (err) => {
    if (err) {
      console.error('Error writing to file:', err);
      return res.status(500).json({ message: "Failed to update review" });
    }
    return res.status(200).json({ message: "Review added/updated successfully", book: books[isbn] });
  });
});
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn; // Extract ISBN
  const username = req.user // Get the current user's username

  if (!isbn  || !username) {
    return res.status(400).json({ message: "ISBN, review, and username are required" });
  }

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Ensure reviews is an object
  books[isbn].reviews = books[isbn].reviews || {};

  // Use username as the key to ensure reviews by the same user overwrite
  books[isbn].reviews[username.username] = "";

  // Write the updated books object back to the file
  fs.writeFile(dataFilePath, `let books = ${JSON.stringify(books, null, 2)};\n\nmodule.exports = books;`, (err) => {
    if (err) {
      console.error('Error writing to file:', err);
      return res.status(500).json({ message: "Failed to update review" });
    }
    return res.status(200).json({ message: "Review added/updated successfully", book: books[isbn] });
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
