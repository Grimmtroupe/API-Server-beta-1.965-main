/////////////////////////////////////////////////////////////////////
// This module is the starting point of the http server
/////////////////////////////////////////////////////////////////////
// Author : Nicolas Chourot
// Lionel-Groulx College
/////////////////////////////////////////////////////////////////////

import APIServer from "./APIServer.js";
import RouteRegister from './routeRegister.js';

RouteRegister.add('GET', 'Bookmarks', 'list');

let server = new APIServer();
let port = process.env.PORT || 5000;

const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());

app.post('/api/data', (req, res) => {
  const { title, text, category, image } = req.body;

  if (!title || !text || !category || !image) {
      return res.status(400).json({ message: 'Title, text, category, and image are required!' });
  }

  const creation = Math.floor(Date.now() / 1000);

  const responseData = {
      id,           
      title,      
      text,         
      category,    
      image,       
      creation,     
  };

  res.status(200).json(responseData);
});


server.start();