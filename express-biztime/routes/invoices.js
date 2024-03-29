const express = require("express");
const router = express.Router();
const db = require("../db");
const ExpressError = require("../expressError");

router.get('/', async (req, res, next) => {
    try {
        const results = await db.query('SELECT * FROM invoices');
        return res.json({invoices: results.rows});
    } catch(err) {
        return next(err);
    }
})

router.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const results = await db.query('SELECT * FROM invoices WHERE id = $1', [id]);
        if (results.rows.length === 0) {
            throw new ExpressError(`Can't find invoice with id of ${id}`, 404);
        }
        return res.send({ invoice: results.rows[0] });
    } catch (err) {
        return next(err);
    }
});


router.post('/', async (req, res, next) => {
    try {
        const { comp_code, amt } = req.body;
        const results = await db.query(
            'INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING id, comp_code, amt, paid, add_date, paid_date', [comp_code, amt]
            );
        return res.status(201).json({invoice: results.rows[0]});
    } catch (err) {
        return next(err);
    }
})

router.put('/:id', async (req, res, next) => {
    try {
        let { id } = req.params;
        let { amt, paid } = req.body;
        let paidDate = null;
        const currResult = await db.query(`SELECT paid FROM invoices WHERE id = $1`, [id]); 
        if (currResult.rows.length === 0) {
            throw new ExpressError(`Can't find invoice with id of ${id}`, 404);
        }
        const currPaidDate = currResult.rows[0].paid_date;

        if(!currPaidDate && paid) {
            paidDate = new Date();
        } else if (!paid) {
            paidDate = null
        } else {
            paidDate = currPaidDate;
        }
        const result = await db.query(`UPDATE invoices SET amt = $1, paid = $2, paid_date = $3 WHERE id = $4
        RETURNING id, comp_code, amt, paid, add_date, paid_date`, [amt, paid, paidDate, id]);

        return res.json({"invoice": result.rows[0]});
    } catch (err) {
        return next(err);
    }
})

router.delete('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const results = await db.query(
            'DELETE FROM invoices WHERE id=$1 RETURNING id',[id]
        );
        if (results.rows.length === 0) {
            throw new ExpressError(`Can't find invoice with id of ${id}`, 404);
        }
        return res.json({ "status": "deleted" })
    } catch(err) {
        return next(err);
    }
})

module.exports = router;