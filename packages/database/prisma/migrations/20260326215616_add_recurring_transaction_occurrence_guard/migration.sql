-- Guard against duplicate generation for the same recurring schedule and date.
CREATE UNIQUE INDEX "transactions_recurring_transaction_id_transaction_date_key"
ON "transactions"("recurring_transaction_id", "transaction_date");
