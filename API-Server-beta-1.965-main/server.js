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

const app = express();

app.use(express.json());


app.post('/api/data', (req, res) => {
    const data = req.body; 
    console.log('Données reçues:', data);
    
    
    res.json({
        message: 'Données reçues avec succès',
        receivedData: data
    });
});
