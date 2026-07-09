const express = require('express');
const mssql = require('mssql');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
app.use(bodyParser.json());
app.use(express.static(__dirname));

// SQL Server Config
const dbConfig = {
    user: 'reliance', 
    password: 'relsoft', // <-- sir, මෙතනට ඔයාගේ SQL sa password එක අනිවාර්යයෙන්ම දෙන්න!
    server: '127.0.0.1',           
    port: 1433,                    
    database: 'UnBikeMart',
    options: {
        encrypt: false,
        trustServerCertificate: true,
        enableArithAbort: true
    }
};

// Global Connection Pool එකක් සාදා ගැනීම (මේකෙන් තමයි Connection හිරවෙන ප්‍රශ්නය විසඳෙන්නේ)
let pool;

async function connectDatabase() {
    try {
        pool = await mssql.connect(dbConfig);
        console.log('============= DATABASE CONNECTED SUCCESSFULLY =============');
    } catch (err) {
        console.error('DATABASE CONNECTION FAILED: ', err.message);
    }
}

// Server එක Start වෙනකොටම Database එක Connect කරගන්නවා
connectDatabase();


// --- VEHICLES API ---

// 1. Get All Vehicles
app.get('/api/vehicles', async (req, res) => {
    try {
        let result = await pool.request().query("SELECT * FROM Vehicles");
        res.json(result.recordset);
    } catch (err) { 
        console.error("Fetch Vehicles Error: ", err.message);
        res.status(500).send(err.message); 
    }
});

// 2. Add Vehicle (Save)
app.post('/api/vehicles', async (req, res) => {
    const { vehicleNumber, purchaseDate, sellerName, location, sellerPhone, investor, purchasePrice, sellingPrice } = req.body;
    try {
        await pool.request()
            .input('vNo', mssql.VarChar, vehicleNumber)
            .input('pDate', mssql.VarChar, purchaseDate) 
            .input('sName', mssql.VarChar, sellerName)
            .input('loc', mssql.VarChar, location)
            .input('sPhone', mssql.VarChar, sellerPhone)
            .input('inv', mssql.VarChar, investor)
            .input('pPrice', mssql.Decimal(18,2), purchasePrice)
            .input('sPrice', mssql.Decimal(18,2), sellingPrice)
            .query(`INSERT INTO Vehicles VALUES (@vNo, CAST(@pDate AS DATE), @sName, @loc, @sPhone, @inv, @pPrice, @sPrice)`);
        
        console.log(`Vehicle ${vehicleNumber} saved successfully!`);
        res.sendStatus(201);
    } catch (err) { 
        console.error("Save Vehicle SQL Error: ", err.message); 
        res.status(500).send(err.message); 
    }
});

// 3. Update Vehicle
app.put('/api/vehicles/:id', async (req, res) => {
    const { purchaseDate, sellerName, location, sellerPhone, investor, purchasePrice, sellingPrice } = req.body;
    try {
        await pool.request()
            .input('vNo', mssql.VarChar, req.params.id)
            .input('pDate', mssql.VarChar, purchaseDate)
            .input('sName', mssql.VarChar, sellerName)
            .input('loc', mssql.VarChar, location)
            .input('sPhone', mssql.VarChar, sellerPhone)
            .input('inv', mssql.VarChar, investor)
            .input('pPrice', mssql.Decimal(18,2), purchasePrice)
            .input('sPrice', mssql.Decimal(18,2), sellingPrice)
            .query(`UPDATE Vehicles SET PurchaseDate=CAST(@pDate AS DATE), SellerName=@sName, Location=@loc, SellerPhone=@sPhone, Investor=@inv, PurchasePrice=@pPrice, SellingPrice=@sPrice WHERE VehicleNumber=@vNo`);
        res.sendStatus(200);
    } catch (err) { 
        console.error("Update Vehicle Error: ", err.message);
        res.status(500).send(err.message); 
    }
});

// 4. Delete Vehicle
app.delete('/api/vehicles/:id', async (req, res) => {
    try {
        await pool.request().input('vNo', mssql.VarChar, req.params.id).query("DELETE FROM Vehicles WHERE VehicleNumber = @vNo");
        res.sendStatus(200);
    } catch (err) { 
        console.error("Delete Vehicle Error: ", err.message);
        res.status(500).send(err.message); 
    }
});


// --- EXPENSES API ---

// 1. Get All Expenses
app.get('/api/expenses', async (req, res) => {
    try {
        let result = await pool.request().query("SELECT * FROM Expenses");
        res.json(result.recordset);
    } catch (err) { 
        console.error("Fetch Expenses Error: ", err.message);
        res.status(500).send(err.message); 
    }
});

// 2. Add Expense (Save)
app.post('/api/expenses', async (req, res) => {
    const { vehicleNumber, description, amount, investor, expenseDate } = req.body;
    try {
        await pool.request()
            .input('vNo', mssql.VarChar, vehicleNumber)
            .input('desc', mssql.VarChar, description)
            .input('amt', mssql.Decimal(18,2), amount)
            .input('inv', mssql.VarChar, investor)
            .input('eDate', mssql.VarChar, expenseDate) 
            .query(`INSERT INTO Expenses VALUES (@vNo, @desc, @amt, @inv, CAST(@eDate AS DATE))`);
        
        console.log(`Expense for ${vehicleNumber} saved successfully!`);
        res.sendStatus(201);
    } catch (err) { 
        console.error("Save Expense SQL Error: ", err.message);
        res.status(500).send(err.message); 
    }
});

// 3. Update Expense
app.put('/api/expenses/:id', async (req, res) => {
    const { vehicleNumber, description, amount, investor, expenseDate } = req.body;
    try {
        await pool.request()
            .input('id', mssql.Int, req.params.id)
            .input('vNo', mssql.VarChar, vehicleNumber)
            .input('desc', mssql.VarChar, description)
            .input('amt', mssql.Decimal(18,2), amount)
            .input('inv', mssql.VarChar, investor)
            .input('eDate', mssql.VarChar, expenseDate)
            .query(`UPDATE Expenses SET VehicleNumber=@vNo, Description=@desc, Amount=@amt, Investor=@inv, ExpenseDate=CAST(@eDate AS DATE) WHERE ExpenseID=@id`);
        res.sendStatus(200);
    } catch (err) { 
        console.error("Update Expense Error: ", err.message);
        res.status(500).send(err.message); 
    }
});

// 4. Delete Expense
app.delete('/api/expenses/:id', async (req, res) => {
    try {
        await pool.request().input('id', mssql.Int, req.params.id).query("DELETE FROM Expenses WHERE ExpenseID = @id");
        res.sendStatus(200);
    } catch (err) { 
        console.error("Delete Expense Error: ", err.message);
        res.status(500).send(err.message); 
    }
});

app.listen(3000, () => console.log('UN BIKE MART Server running on port 3000'));