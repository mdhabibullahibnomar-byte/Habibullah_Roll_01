const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'movie_info'
});

db.connect((err) => {
    if (err) {
        console.log('Error connecting to the database:', err);
    } else {
        console.log('Connected to the database.');
    }
});

app.get('/movie', (req, res) => {
    const query = `
        SELECT 
            Movie.Movie_ID,
            Movie.Movie_Name,
            Movie.Genre,
            Movie.Year,
            Movie.IMDb_Rating,
            Movie.Director_ID,
            Director.Director_Name
        FROM Movie
        JOIN Director
        ON Movie.Director_ID = Director.Person_ID
    `;

    db.query(query, (err, result) => {
        if (err) {
            console.log('Error fetching data from database:', err);
            return res.status(500).json({
                message: 'Error fetching data from database'
            });
        }

        res.json(result);
    });
});

app.post('/addmovie', (req, res) => {
    const {
        Movie_Name,
        Genre,
        Year,
        IMDb_Rating,
        Director_ID
    } = req.body || {};

    console.log('Received:', req.body);

    if (!Movie_Name || !Genre || !Year || !IMDb_Rating || !Director_ID) {
        return res.status(400).json({
            message: 'All fields are required'
        });
    }

    const query = `
        INSERT INTO Movie
        (Movie_Name, Genre, Year, IMDb_Rating, Director_ID)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(
        query,
        [Movie_Name, Genre, Year, IMDb_Rating, Director_ID],
        (err, result) => {
            if (err) {
                console.log('Error inserting movie:', err);
                return res.status(500).json({
                    message: 'Error adding movie'
                });
            }

            res.status(201).json({
                message: 'Movie added successfully',
                Movie_ID: result.insertId
            });
        }
    );
});

const port = 3000;

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});