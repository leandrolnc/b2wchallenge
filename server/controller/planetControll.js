const mongo = require('mongodb').MongoClient;
const assert = require('assert');
const swapi=require('swapi-node');

let ObjectId = require('mongodb').ObjectID;

const url = 'mongodb+srv://leandrolnc:hsq9XZQj5LUQPa38@cluster0-wi7qd.gcp.mongodb.net/dbplanets?retryWrites=true';

module.exports = {

    async getPlanets(dados, request){

        let planets = [];
        let db = await mongo.connect(url);
        let dbo = db.db("dbplanets");

        let filter = null;

        if(request.query.id){
            filter = {_id: ObjectId(request.query.id)}
        }
        else if(request.query.name){
            filter = {name: request.query.name}
        }

        let cursor = await dbo.collection('planets').find(filter);

        for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {

            let aux = dados.find(p=>{
                return p.name.toLowerCase() == doc.name.toLowerCase();
            })

            if(aux){
                doc.films = aux.films;
            }
            planets.push(doc);
        }

        db.close();

        return planets;

    },

    async putPlanet(planet, dados, err){

        let aux = {};

        let foundPlanet = dados.find(p=>{
            return p.name.toLowerCase() == planet.name.toLowerCase();
        });


        if(foundPlanet){
        
            let db = await mongo.connect(url);
            let dbo = db.db("dbplanets");
    
            await dbo.collection('planets').insertOne(planet, null, function(err, result){
                assert.equal(null, err);
                db.close();
                aux = result.ops[0];
            });
        }
        else{
            err.push({erro: "Planeta '" + planet.name + "' não faz parte do mundo Star Wars"});
        }
        
        return aux;
    },

    async deletePlanet(id, err){

        let aux = {}
        let db = await mongo.connect(url);
        let dbo = db.db("dbplanets");
        
        let planetID = {"_id": ObjectId(id)};

        await dbo.collection('planets').deleteOne(planetID, {}, function(err, result){
            //assert.equal(null, err);
            aux = result;
            db.close();
            
        });
         
        
        return aux;

    },

    async fetchPlanets(planets){


        let url = 'http://swapi.co/api/planets/?page=1';
        this.getApiPlanets(url, planets);
    
    },

    async getApiPlanets(url, planets){

        if(url){
            swapi.get(url.replace('https','http')).then((result) => {
                //console.log(result);    
                
                if(Array.isArray(result.results)){

                    result.results.forEach(element => {
                        planets.push(
                            {
                                name: element.name,
                                films: element.films.length
                            }
                        )
                    });
                }
                //console.log(planets.length);
                //console.log(result.next.replace('https','http'));
                this.getApiPlanets(result.next, planets);
    
            }).catch((err) => {
                console.log(err);
            });
        }
    }

}
