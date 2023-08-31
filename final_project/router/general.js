const express = require('express');
const axios = require("axios");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const getDetailbook = require("./auth_users.js").getDetailbook;
const public_users = express.Router();
const config = require('../config.js'); 


const doesExist = (username)=>{
    let userswithsamename = users.filter((user)=>{
      return user.username === username
    });
    if(userswithsamename.length > 0){
      return true;
    } else {
      return false;
    }
  }

public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
  
    if (username && password) {
      if (!doesExist(username)) { 
        users.push({"username":username,"password":password});
        return res.status(200).json({message: "User successfully registred. Now you can login"});
      } else {
        return res.status(404).json({message: "User already exists!"});    
      }
    } 
    return res.status(404).json({message: "Unable to register user."});
});

// endpoint '/' books, which allows us to consume by axios in the method get '/' &  '/isbn/:isbn' 
public_users.get('/books', function (req, res) {
  //Write your code here
    const myPromise = new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve(books);
        }, 300);
      });
      
    myPromise.then((result) => {res.status(200).json({books:result})})
    .catch((err) => res.status(500).json('Error interno del servidor'));  
});

public_users.get('/', function (req, res) {

  const url =  `${config.apiUrl}:${config.port}/books/`;
  axios.get(url)  
    .then((response) => {
      res.status(200).json({ books: response.data });
    })
    .catch((error) => {
      res.status(500).json(`Error interno del servidor ${error.message} `);
    });
});


// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
  //Write your code here
  const url =  `${config.apiUrl}:${config.port}/books/`;
  axios.get(url)  
    .then((response) => {
      res.status(200).json(response.data.books[req.params.isbn]);
    })
    .catch((error) => {
      res.status(500).json(`Error interno del servidor ${error.message} `);
    });
 });
  
 async function findBooksByAuthor(author, books) {
    const booksFound = [];
  
    for (const key in books) {
      if (books.hasOwnProperty(key)) {
        const book = books[key];
        if (book.author === author) {
          booksFound.push(book);
        }
      }
    }
    return booksFound;
}
  
get('/books/author/:author', async function (req, res) {
  //Write your code here
    const myPromise = new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve(findBooksByAuthor(req.params.author, books));
        }, 300);
      });
      
    myPromise.then((result) => {res.status(200).json(result)})
    .catch((err) => res.status(500).json('Error interno del servidor'));  
});

// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
 
  const url =  `${config.apiUrl}:${config.port}/books/author/${req.params.author}`;
  axios.get(url)  
    .then((response) => {
      res.status(200).json(response.data);
    })
    .catch((error) => {
      res.status(500).json(`Error interno del servidor ${error.message} `);
    });
});

async function findBooksByTitle(title, books) {
    const booksFound = [];
    for (const key in books) {
      if (books.hasOwnProperty(key)) {
        const book = books[key];
        if (book.title === title) {
          booksFound.push(book);
        }
      }
    }
  return booksFound;
}


public_users.get('/books/title/:title', async function (req, res) {
  const myPromise = new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(findBooksByTitle(req.params.title, books));
    }, 300);
  });

  myPromise.then(booksFound => {
    if(booksFound.length > 0)
      return res.status(200).json(booksFound);  
    else       
      return res.status(404).json("title not found");  
  })
  .catch(error => {
    return res.status(400).json(error.message);   
  });
});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
    
  const url =  `${config.apiUrl}:${config.port}/books/title/${req.params.title}`;
  axios.get(url)  
    .then((response) => {
      res.status(200).json(response.data);
    })
    .catch((error) => {
      res.status(500).json(`Error interno del servidor ${error.message} `);
    });
});

//  Get book review
public_users.get('/review/:isbn',async function (req, res) {
  //Write your code here

  const bookDetails = await getDetailbook(req.params.isbn)

    if (bookDetails) {     
      
      return res.status(200).json(bookDetails.reviews);
    } 
    return res.status(404).json({ error: 'book not found ' });
});

module.exports.general = public_users;
