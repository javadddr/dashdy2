import React, { useState, useEffect } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Pagination,
} from "@heroui/react";

function Invoico({ email, invoices }) {
  const [cusinvo, setCusinvo] = useState([]);
  const [upcomingIn, setUpcomingIn] = useState(null);
  const [page, setPage] = useState(1);
  const rowsPerPage = 5;
console.log("invoices",invoices)
  useEffect(() => {
    const extractedEmail = email.match(/\(([^)]+)\)/)?.[1];

    if (extractedEmail && invoices?.length > 0) {
      const filteredSubscriptions = invoices.filter(
        (subscription) => subscription.customer_email === extractedEmail
      );

      setCusinvo(filteredSubscriptions);

      if (filteredSubscriptions.length > 0) {
        const subscription = filteredSubscriptions[0];
        const fetchUpcomingInvoices = async () => {
          try {
            const response = await fetch(
              `https://api.stripe.com/v1/invoices/upcoming?customer=${subscription.customer}`,
              {
                method: "GET",
                headers: {
                  Authorization: `Bearer ${import.meta.env.VITE_STRIPE_SECRET_KEY}`,
                },
              }
            );

            if (!response.ok) {
              throw new Error("Failed to fetch upcoming invoices");
            }

            const data = await response.json();
            setUpcomingIn(data);
          } catch (error) {
            console.error("Error fetching upcoming invoices:", error);
          }
        };

        fetchUpcomingInvoices();
      }
    }
  }, [email, invoices]);

  const paginatedData = cusinvo.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  return (
    <div className="flex flex-col">
      <div>
        <h2>Upcoming Invoices</h2>
        {upcomingIn ? (
          <div className="flex">
         
            <p className="pr-4">
            <span className="text-yellow-500">Amount Due:{" "}</span>
              {upcomingIn.amount_due
                ? (upcomingIn.amount_due / 100).toFixed(0)
                : "N/A"}{" "}
           
            </p>
       <span className="pr-2 text-yellow-500">Due Date:</span>
            {new Date(
                      upcomingIn.next_payment_attempt * 1000
                    ).toLocaleString()}
          </div>
        ) : (
          <p>Loading upcoming invoices...</p>
        )}
      </div>

      <div>
        {cusinvo.length > 0 ? (
          <Table
            aria-label="Customer Invoices"
            classNames={{
              wrapper: "min-h-[360px]",
            }}
          >
            <TableHeader>
              <TableColumn>Status</TableColumn>
              <TableColumn>Amount Paid</TableColumn>
              <TableColumn>Period Start</TableColumn>
              <TableColumn>Description</TableColumn>
              <TableColumn>Download Invoice</TableColumn>
            </TableHeader>
            <TableBody items={paginatedData}>
              {(subscription) => (
                <TableRow key={subscription.id}>
                  <TableCell>{subscription.status}</TableCell>
                  <TableCell>
                    ${(subscription.amount_paid / 100).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {new Date(
                      subscription.effective_at * 1000
                    ).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {subscription.lines.data[0]?.description || "N/A"}
                  </TableCell>
                  <TableCell>
                    <Button
                      as="a"
                      href={subscription.invoice_pdf}
                      size="sm"
                      rel="noopener noreferrer"
                      color="warning"
                      variant="flat"
                    >
                      Download
                    </Button>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        ) : (
          <p>No subscriptions found for <strong>{email}</strong>.</p>
        )}

     <div className="flex justify-center mt-2"> 
        <Pagination
          isCompact
          showControls
          showShadow
          color="warning"
          page={page}
          total={Math.ceil(cusinvo.length / rowsPerPage)}
          onChange={(newPage) => setPage(newPage)}
        />
        </div>
      </div>
    </div>
  );
}

export default Invoico;
