import pg from "pg";
import cors from "cors";
import express from "express";
const { Pool } = pg;
const link = "postgres://public_readonly:nearprotocol@testnet.db.explorer.indexer.near.dev/testnet_explorer";
const pool = new Pool({ connectionString: link });
const port = process.env.PORT || 5001;
const app = express();
app.use(
	cors({
		origin: "*", // allow to server to accept request from different origin
	})
);
app.get("/fetch", async (req, res) => {
	const data = await fetch(req.query.accountId);
	res.json(data);
});

async function fetch(accountId) {
	const client = await pool.connect();

	const query = `SELECT * FROM assets__non_fungible_token_events WHERE token_new_owner_account_id = '${accountId}' `;
	const res = await client.query(query);
	let contractIds = [];
	res.rows.forEach((row) => {
		if (!contractIds.includes(row.emitted_by_contract_account_id)) {
			contractIds.push(row.emitted_by_contract_account_id);
		}
	});

	console.log("DONE");

	client.release();
	return contractIds;
}

app.listen(port, () => {
	console.log("Listening on port " + port);
});
