/////////////////////////////////////////////////////////////////////
// This module is the starting point of the http server
/////////////////////////////////////////////////////////////////////
// Author : Nicolas Chourot
// Lionel-Groulx College
/////////////////////////////////////////////////////////////////////

import APIServer from "./APIServer.js";
import RouteRegister from './routeRegister.js';

RouteRegister.add('GET', 'Bookmarks', 'list');
RouteRegister.add('POST', 'Articles', 'list')

let server = new APIServer();
server.start();

