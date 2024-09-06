const express = require('express');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const public_users = express.Router();

// Define the path for the data file
const dataFilePath = path.join(__dirname, 'data.json');

// Read and parse existing data from file
let myObject;
try {
  myObject = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
} catch (err) {
  console.error("Error reading or parsing data.json:", err);
  myObject = { users: [] }; // Initialize with an empty users array if error occurs
}

// Route to register a new user
public_users.post("/register", async (req, res) => {
  const { username, password } = req.body;

  // Validate inputs
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  // Check if username already exists
  const userExists = myObject.users.some(user => user.username === username);
  if (userExists) {
    return res.status(400).json({ message: "User already exists." });
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Add the new user to the array
  myObject.users.push({ username, password: hashedPassword });

  // Update data.json
  fs.writeFile(dataFilePath, JSON.stringify(myObject, null, 2), err => {
    if (err) {
      console.error("Error writing file:", err);
      return res.status(500).json({ message: "Error registering user." });
    }
    console.log("New data added");
    return res.status(201).json({ message: "User registered successfully" });
  });
});


// Get the book list available in the shop
public_users.get('/', async function (req, res) {
  if (books) {
    return  await res.status(200).json({ books });
  }
  return res.status(404).json({ message: "No books in the library" });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
  const isbn = Number(req.params.isbn);

  if (books && books[isbn]) {
    return  await res.status(200).json({ book: books[isbn] });
  }
  return res.status(404).json({ message: "Book not found" });
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;

  if (!author) {
    return res.status(400).json({ message: "No author provided" });
  }

  const findAuthorbook = Object.values(books).filter(book => book.author === author);

  if (findAuthorbook.length > 0) {
    return res.status(200).json(findAuthorbook);
  }
  return res.status(404).json({ message: "No books found by this author" });
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;

  if (!title) {
    return res.status(400).json({ message: "No title provided" });
  }

  const findbook = Object.values(books).filter(book => book.title === title);

  if (findbook.length > 0) {
    return res.status(200).json(findbook);
  }
  return res.status(404).json({ message: "No books found with this title" });
});

// Get book reviews based on ISBN
public_users.get('/review/:isbn', function (req, res) {
  const isbn = Number(req.params.isbn);

  if (!isbn) {
    return res.status(400).json({ message: "Please provide a valid ISBN number" });
  }

  if (books && books[isbn] && books[isbn].reviews) {
    return res.status(200).json({ reviews: books[isbn].reviews });
  }
  return res.status(404).json({ message: "No reviews found for this book" });
});

module.exports.general = public_users;
