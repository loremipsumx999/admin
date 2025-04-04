import cors from "cors";
import argon from "argon2";
import mysql from "mysql2/promise";
import dotenv from "dotenv";
import express from "express";
import jwt from "jsonwebtoken";


dotenv.config();
const app = express();
app.use = (express.json());
app.use(cors());
const port = 3001;

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

//Regisztráció
app.post("/register", async (req, res) =>{
    const { username, password, email} = req.body;

    try{
        const [users] = await db.query("SELECT * FROM users WHERE username = ?", [username]);
        if (users.length > 0){
            return res.status(400).json({ message: "Már létezik ilyen felhasználónév."}) //Bad request
        }
        else{
            const hashedPassword = await argon.hash(password);
            await db.query("INSERT INTO users (username, password, email) VALUES (?, ?, ?)", [username, hashedPassword, email]);
            res.status(201).json({ message: "Sikeres regisztráció!" }); //Request was successful
        }
    }
    catch (err){
        console.error("Hiba a regisztráció közben: ", err);
        res.status(500).json({ message: "Hiba a regisztráció közben!" }); //Internal server error
    }
})

//Bejelentkezés
app.post("/login", async (req, res) =>{
    const { username, password } = req.body;

    try{
        const [users] = await db.query("SELECT * FROM users WHERE username = ?", [username]);
        if (users.length === 0){
            return res.status(404).json({ message: "Nincs ilyen felhasználó" }); //Not found
        }
        const user = users[0];

        const isMatch = await argon.verify(user.password, password);
        if (!isMatch){
            return res.status(401).json({ message: "Helytelen jelszó!" }); //Unauthorized
        }

        const token = jwt.sign({id: user[0].id, username: users[0].username, rights: users[0].rights }, process.env.SECRET_KEY, { expiresIn: "1h" });
        res.status(200).json({ message: "Sikeres bejelentkezés!", token }); //Request OK
        console.log(token);
    }
    catch (err){
        console.error("Hiba a bejelentkezés során: ", err);
        res.status(500).json({ message: "Hiba a bejelentkezés során! " }); //Internal server error
    }
});

//Felhasználók lekérdezése
app.get("/getUsers", async (req, res) =>{
    try{
        const [users] = await db.query("SELECT * FROM users");
        res.status(200).json(users); //Request OK
    }
    catch(err){
        res.status(500).json({ message: "Nem sikerült lekérni a felhasználók adatait." }); //Internal server error
    }
});

//Felhasználók frissítése (admin)
app.post("/updateUsers", async (req, res) =>{
    const { id, username, email, rights } = req.body;

    try{
        if(!id || !username || !email || !rights){
            return res.status(400).json({ message: "Hiányzó adatok!" }); //Bad request
        }
        const [users] = await db.query("UPDATE users SET username = ?, email = ?, rights = ? WHERE id = ?", [username, email, rights, id]);

        if(users.affectedRows === 0){
            return res.status(404).json({ message: "Felhasználó nem található!" }); //Not found
        }
        res.status(200).json("Sikeres profil szerkesztés!"); //Request was OK
    }
    catch(err){
        res.status(500).json({ message: "Valami hiba történt a profil szerkesztése során!" }); //Internal server error
    }
});

//Felhasználó frissítése (átlagos user)
app.put("/profile", async (req, res) => {
    const { username, email, currentPassword, newPassword } = req.body;
    const token = req.headers.authorization?.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        
        const [user] = await db.query("SELECT password FROM users WHERE id = ?", [decoded.id]);
        if (!user[0]) {
            return res.status(404).json({ message: "Felhasználó nem található!" }); //Not found
        }

        if (newPassword) {
            if (!currentPassword) {
                return res.status(400).json({ message: "Add meg a jelenlegi jelszavadat!" }); //Bad request
            }
            
            const isMatch = await argon2.verify(user[0].password, currentPassword);
            if (!isMatch) {
                return res.status(401).json({ message: "A jelenlegi jelszó helytelen!" }); //Unauthorized
            }
            
            const hashedPassword = await argon2.hash(newPassword);
            await db.query("UPDATE users SET password = ? WHERE id = ?", [hashedPassword, decoded.id]);
        }

        const [result] = await db.query("UPDATE users SET username = ?, email = ? WHERE id = ?", [username, email, decoded.id]);

        res.status(200).json({ message: "Profil sikeresen frissítve!" }); //Request OK
    } catch (err) {
        console.error("Hiba a profil szerkesztése közben: ", err);
        res.status(500).json({ message: "Hiba a profil frissítése közben!" }); //Internal server error
    }
});

app.listen(port, () =>{
    console.log(`A szerver fut a ${port}-es porton.`)
})