const express = require('express');
const app = express();

const mysql = require('mysql2');

const Fuse = require('fuse.js');

const dotenv = require('dotenv').config();

var con = mysql.createConnection({
  connectionLimit : process.env.DB_CONLIMIT,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
});


app.get('/anime', (req, res) => {
    const query = req.query.title;
  
    con.connect(function(err) {
        if (err) {
            console.error(err);
            res.status(500).send({ error: "Database connection error" });
            return;
        }
  
        const sql = "SELECT id, title, score, main_picture, start_season FROM anime";
        con.query(sql, function (err, result, fields) {
            if (err) {
            console.error(err);
            res.status(500).send({ error: "Database query error" });
            return;
            }
  
            console.log(result)
            // Extract titles from the result
            // const titles = result.map((row) => row.title);

            // console.log(titles)
    
            // Create a new Fuse instance with the titles
            const fuse = new Fuse(result, {
                includeScore: true, // Include search score in results
                keys: ['title'], // Specify the property to search on
            });
    
            // Perform fuzzy search with the query
            const searchResults = fuse.search(query);

            //console.log(searchResults)
    
            // Extract the titles from the search results and sort them
            const sortedTitles = searchResults.map(
                (result) => {
                    return {title: result.item.title, similarity: result.score, id: result.item.id, image: result.item.main_picture, score: result.item.score, season: result.item.start_season}
                }).sort((a, b) => a.score - b.score);
    
            //console.log(sortedTitles);
            res.send(sortedTitles);
        });
    });
});

app.get('/ranking', (req, res) => {
  
    con.connect(function(err) {
        if (err) {
            console.error(err);
            res.status(500).send({ error: "Database connection error" });
            return;
        }
  
        const sql = "SELECT id, title, score, main_picture, start_season FROM anime";
        con.query(sql, function (err, result, fields) {
            if (err) {
            console.error(err);
            res.status(500).send({ error: "Database query error" });
            return;
            }
  
            console.log(result)

            // Extract the titles from the search results and sort them
            const sortedTitles = result.map(
                (result) => {
                    return {title: result.title, id: result.id, image: result.main_picture, score: result.score, season: result.start_season}
                }).sort((a, b) => b.score - a.score);
    
            //console.log(sortedTitles);
            res.send(sortedTitles);
        });
    });
});

app.get('/locations', (req, res) => {
    console.log("/locations");
    console.log(req.query);
    const query = req.query.anime_id;
  
    con.connect(function(err) {
        if (err) {
            console.error(err);
            res.status(500).send({ error: "Database connection error" });
            return;
        }
  
        //const sql = "SELECT * FROM locations WHERE anime_id = " + query;

        const sql = `
            SELECT i.id, i.location_id, l.location_name, l.coordinates, i.anime_image, i.real_image, l.location_name
            FROM images as i
            JOIN locations as l ON i.location_id = l.id
            WHERE l.anime_id = `
            + query +
            `
            AND i.id IN (
            SELECT MIN(id)
            FROM images
            GROUP BY location_id
            );
            `

        con.query(sql, function (err, result, fields) {
            if (err) {
            console.error(err);
            res.status(500).send({ error: "Database query error" });
            return;
            }

            //console.log(searchResults)
    
            //console.log(sortedTitles);
            res.send(result);
        });
    });
});

app.get('/images', (req, res) => {
    console.log("/images");
    console.log(req.query);

    if ('anime_id' in req.query) {
        const query = req.query.anime_id;
  
        con.connect(function(err) {
            if (err) {
                console.error(err);
                res.status(500).send({ error: "Database connection error" });
                return;
            }
      
            //const sql = "SELECT * FROM images WHERE location_id = " + query;

            const sql = `
            SELECT i.id, i.location_id, l.location_name, l.coordinates, i.anime_image, i.real_image, l.location_name
            FROM images as i
            JOIN locations as l ON i.location_id = l.id
            WHERE l.anime_id = `
            + query

            con.query(sql, function (err, result, fields) {
                if (err) {
                console.error(err);
                res.status(500).send({ error: "Database query error" });
                return;
                }
    
                //console.log(searchResults)
        
                //console.log(sortedTitles);
                res.send(result);
            });
        });
    }

    if ('location_id' in req.query) {
        const query = req.query.location_id;
  
        con.connect(function(err) {
            if (err) {
                console.error(err);
                res.status(500).send({ error: "Database connection error" });
                return;
            }
      
            const sql = "SELECT * FROM images WHERE location_id = " + query;
            con.query(sql, function (err, result, fields) {
                if (err) {
                console.error(err);
                res.status(500).send({ error: "Database query error" });
                return;
                }
    
                //console.log(searchResults)
        
                //console.log(sortedTitles);
                res.send(result);
            });
        });
    }

});

/*
app.get('/anime', (req, res) => {
    title = req.query.title;
    con.connect(function(err) {
        if (err) throw err;
        con.query("SELECT title FROM anime", function (err, result, fields) {
          if (err) throw err;
          console.log(result);
        });
      });
    res.send({ message: "!!!" });
});*/

app.listen(3000, () => {
    console.log('Application listening on port 3000!');
});