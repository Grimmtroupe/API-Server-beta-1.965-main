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
server.start();

const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const upload = multer({
  dest: 'uploads/', 
  limits: { fileSize: 10 * 1024 * 1024 }, 
});

let items = [];

function generateId() {
  return 'id-' + Math.random().toString(36).substr(2, 9);
}

app.post('/items', upload.single('image'), (req, res) => {
  const { title, text, category, creation } = req.body;
  const image = req.file ? req.file.filename : null;

  const newItem = {
    id: generateId(),
    title,
    text,
    category,
    image,
    creation: parseInt(creation, 10),
  };

  items.push(newItem);
  res.status(201).json(newItem);
});

app.get('/items', (req, res) => {
  res.json(items);
});

app.get('/items/:id', (req, res) => {
  const item = items.find(i => i.id === req.params.id);
  if (!item) {
    return res.status(404).json({ message: 'Item not found' });
  }
  res.json(item);
});

app.put('/items/:id', upload.single('image'), (req, res) => {
  const itemIndex = items.findIndex(i => i.id === req.params.id);
  if (itemIndex === -1) {
    return res.status(404).json({ message: 'Item not found' });
  }

  const updatedItem = {
    ...items[itemIndex],
    title: req.body.title || items[itemIndex].title,
    text: req.body.text || items[itemIndex].text,
    category: req.body.category || items[itemIndex].category,
    image: req.file ? req.file.filename : items[itemIndex].image,
    creation: req.body.creation ? parseInt(req.body.creation, 10) : items[itemIndex].creation,
  };

  items[itemIndex] = updatedItem;
  res.json(updatedItem);
});

app.delete('/items/:id', (req, res) => {
  const itemIndex = items.findIndex(i => i.id === req.params.id);
  if (itemIndex === -1) {
    return res.status(404).json({ message: 'Item not found' });
  }

  const deletedItem = items.splice(itemIndex, 1)[0];
  if (deletedItem.image) {
    fs.unlinkSync(path.join('uploads', deletedItem.image));
  }

  res.json({ message: 'Item deleted successfully' });
});
