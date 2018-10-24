'use strict';

const Hapi=require('hapi');
const Joi=require('joi');

const Ctrl=require('./controller/planetControll');

var planets = [];

// Create a server with a host and port
const server= new Hapi.server({
    host:'localhost',
    port:8000,
    routes: {cors: true}
});




// GET Planets
server.route({
    method:'GET',
    path:'/planet',
    handler: async function(request,h) {
        let aux = await Ctrl.getPlanets(planets, request);
        return h.response(aux).code(200);
    }
});

//PUT Planet
server.route({
    method:'PUT',
    path:'/planet',
    handler: async function(request,h) {
        let err = [];
        let planet = await Ctrl.putPlanet(request.payload, planets, err);

        if(err.length > 0){
            return h.response(err[0].erro).code(500);
        }
        else{
            return h.response(planet).code(200);
        }
        
    },
    options: {
        validate: {
            payload: {
                name: Joi.string().max(50),
                climate: Joi.string().required().max(50),
                terrain: Joi.string().required().max(50)
            }
        }
    }
});

//DELETE TODO
server.route({
    method:'DELETE',
    path:'/planet/{id}',
    handler: async function(request,h) {
        
        let err = {};

        let result = await Ctrl.deletePlanet(request.params.id, err);
 
        return h.response(result).code(200);
    }/*,
    options: {
        validate: {
            params: {
                id: Joi.number().integer().min(1)
            }
        }
    }*/
});



// Start the server
async function start() {

    try {
        await server.register([require('vision'), require('inert'), require('lout')]);
        await server.start();
        await Ctrl.fetchPlanets(planets);
    }
    catch (err) {
        console.log(err);
        process.exit(1);
    }

    console.log('Server running at:', server.info.uri);
};

start();