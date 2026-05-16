import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useGlobalContext } from "./GlobalProvider";

// Helper to get month-year from timestamp
const getMonthYearFromTimestamp = (timestamp) => {
  const date = new Date(timestamp * 1000);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
};

// Helper to format month for display
const formatMonthHeader = (monthYear) => {
  const [year, month] = monthYear.split("-");
  const date = new Date(`${year}-${month}-01`);
  return date.toLocaleString("default", { month: "short", year: "2-digit" });
};

// Helper to get all months between start and end dates
const getAllMonths = (startDate, endDate) => {
  const months = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  start.setDate(1);
  end.setDate(1);
  
  const current = new Date(start);
  while (current <= end) {
    const year = current.getFullYear();
    const month = String(current.getMonth() + 1).padStart(2, "0");
    months.push(`${year}-${month}`);
    current.setMonth(current.getMonth() + 1);
  }
  
  return months;
};

function CustomerPaymentTimeline() {
  const { invoices } = useGlobalContext();
  const [paymentData, setPaymentData] = useState([]);
  const [allMonths, setAllMonths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (invoices && invoices.length > 0) {
      processInvoices(invoices);
    } else {
      setLoading(false);
    }
  }, [invoices]);

  const processInvoices = (invoicesData) => {
    try {
      // Filter only paid invoices
      const paidInvoices = invoicesData.filter(inv => inv.status === 'paid' && inv.amount_paid > 0);
      
      // Group payments by customer email with invoice details
      const customerPayments = new Map(); // email -> { customerName, payments: Map of month -> [invoices] }
      
      let earliestDate = new Date(2023, 1, 1); // Start from Feb 2023
let latestDate = new Date(2023, 1, 1); // Start from Feb 2023
let currentDate = new Date(); // Get current date
      
      paidInvoices.forEach(invoice => {
        const email = invoice.customer_email;
        if (!email) return;
        
        const paymentDate = invoice.created;
        const monthYear = getMonthYearFromTimestamp(paymentDate);
        const paymentDateObj = new Date(paymentDate * 1000);
        
        if (paymentDateObj < earliestDate) earliestDate = paymentDateObj;
        if (paymentDateObj > latestDate) latestDate = paymentDateObj;
        
        if (!customerPayments.has(email)) {
          customerPayments.set(email, {
            customerName: invoice.customer_name || email.split('@')[0],
            email: email,
            payments: new Map()
          });
        }
        
        const customer = customerPayments.get(email);
        if (!customer.payments.has(monthYear)) {
          customer.payments.set(monthYear, []);
        }
        customer.payments.get(monthYear).push(invoice);
      });
      
      // Include current month even if no invoices
// Include current month even if no invoices
// Set end date to current date (including current month)
const endDate = new Date(currentDate);
endDate.setMonth(endDate.getMonth() ); // Add one month to ensure current month is included
endDate.setDate(1); // Set to first day of next month

const months = getAllMonths(earliestDate, endDate);
setAllMonths(months);
      
      const paymentArray = Array.from(customerPayments.values())
        .sort((a, b) => a.email.localeCompare(b.email));
      
      setPaymentData(paymentArray);
      setLoading(false);
    } catch (error) {
      console.error("Error processing invoices:", error);
      setLoading(false);
    }
  };

  const handleCellClick = (customer, month, invoicesInMonth) => {
    if (invoicesInMonth && invoicesInMonth.length > 0) {
      setSelectedInvoice({
        customer: customer,
        month: month,
        invoices: invoicesInMonth
      });
      setDrawerOpen(true);
    }
  };

  const formatCurrency = (amount, currency) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 2
    }).format(amount / 100);
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  if (loading) {
    return (
      <Card className="dark">
        <CardHeader>
          <CardTitle>Customer Payment Timeline</CardTitle>
          <CardDescription>Loading payment data...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (paymentData.length === 0) {
    return (
      <Card className="dark">
        <CardHeader>
          <CardTitle>Customer Payment Timeline</CardTitle>
          <CardDescription>No payment data available</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <>
      <div className="text-white">
        <Card className="w-full">
          <CardHeader className="pb-2">
            <CardTitle>Customer Payment Timeline</CardTitle>
            <CardDescription>
              Monthly payment history - Click on red cells to view invoice details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <div className="overflow-x-auto pb-2" style={{ maxHeight: 'calc(100vh - 250px)' }}>
                <div className="min-w-max">
                  {/* Header row */}
                  <div className="flex border-b border-gray-700 sticky top-0 bg-gray-900 z-10">
                    <div className="w-[200px] flex-shrink-0 p-1.5 text-[11px] font-semibold text-gray-300 sticky left-0 bg-gray-900 z-20 border-r border-gray-700">
                      Customer
                    </div>
                    <div className="flex">
                      {allMonths.map((month) => (
                        <div
                          key={month}
                          className="w-[30px] flex-shrink-0 p-1.5 text-center font-semibold text-gray-300 text-[10px] border-r border-gray-700"
                        >
                          {formatMonthHeader(month)}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Data rows */}
                  <div className="divide-y divide-gray-700">
                    {paymentData.map((customer) => (
                      <div key={customer.email} className="flex hover:bg-gray-800/30 transition-colors">
                        {/* Customer info column - sticky */}
                        <div className="w-[200px] flex-shrink-0 p-1.5 sticky left-0 bg-gray-900 border-r border-gray-700">
                          <div className="text-[11px] font-medium text-gray-200 truncate" title={customer.email}>
                            {customer.email}
                          </div>
                          {customer.customerName !== customer.email && (
                            <div className="text-[9px] text-gray-400 truncate">
                              {customer.customerName}
                            </div>
                          )}
                        </div>
                        
                        {/* Payment cells */}
                        <div className="flex">
                          {allMonths.map((month) => {
                            const invoicesInMonth = customer.payments.get(month);
                            const hasPaid = invoicesInMonth && invoicesInMonth.length > 0;
                            return (
                              <div
                                key={`${customer.email}-${month}`}
                                onClick={() => hasPaid && handleCellClick(customer, month, invoicesInMonth)}
                                className={`w-[30px] flex-shrink-0 p-1.5 text-center text-[9px] border-r border-gray-700 transition-all cursor-pointer ${
                                  hasPaid
                                    ? 'bg-red-600/80 text-white font-medium hover:bg-red-500 hover:scale-105'
                                    : 'bg-gray-800/30 text-gray-600 hover:bg-gray-700/50'
                                }`}
                                title={hasPaid ? `${invoicesInMonth.length} payment(s) in ${formatMonthHeader(month)} - Click to view` : `No payment in ${formatMonthHeader(month)}`}
                              >
                                {hasPaid ? invoicesInMonth.length : '—'}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Legend */}
            <div className="mt-3 flex items-center gap-3 text-[10px]">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-red-600/80 rounded"></div>
                <span className="text-gray-300">Has payment (click for details)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-gray-800/30 rounded"></div>
                <span className="text-gray-300">No payment</span>
              </div>
              <div className="text-gray-400 text-[9px] ml-auto">
                Customers: {paymentData.length} | Months: {allMonths.length}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Drawer for invoice details */}
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent className="bg-gray-900 border-gray-700">
          <div className="mx-auto w-full max-w-3xl">
            <DrawerHeader>
              <DrawerTitle className="text-gray-100">
                Invoice Details
              </DrawerTitle>
              <DrawerDescription className="text-gray-400">
                {selectedInvoice && (
                  <>
                    {selectedInvoice.customer.customerName || selectedInvoice.customer.email} - {formatMonthHeader(selectedInvoice.month)}
                  </>
                )}
              </DrawerDescription>
            </DrawerHeader>
            
            <div className="p-4">
              {selectedInvoice && (
                <div className="space-y-4">
                  {selectedInvoice.invoices.map((invoice, idx) => (
                    <div key={invoice.id} className="border border-gray-700 rounded-lg p-4 bg-gray-800/50">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="text-sm font-semibold text-gray-200">
                            Invoice #{invoice.number || invoice.id.slice(-8)}
                          </div>
                          <div className="text-xs text-gray-400">
                            Date: {formatDate(invoice.created)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-400">
                            {formatCurrency(invoice.amount_paid, invoice.currency)}
                          </div>
                          <div className="text-xs text-gray-400">
                            Status: <span className="text-green-400 capitalize">{invoice.status}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Invoice items */}
                      {invoice.lines?.data && invoice.lines.data.length > 0 && (
                        <div className="mt-3 space-y-2">
                          <div className="text-xs font-semibold text-gray-300 mb-2">Items:</div>
                          {invoice.lines.data.map((line, lineIdx) => (
                            <div key={lineIdx} className="text-xs text-gray-400 pl-2 border-l-2 border-gray-600">
                              <div>{line.description}</div>
                              <div className="flex justify-between mt-1">
                                <span>Qty: {line.quantity || 1}</span>
                                <span>{formatCurrency(line.amount, line.currency)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Links */}
                      <div className="mt-3 flex gap-2">
                        {invoice.hosted_invoice_url && (
                          <a
                            href={invoice.hosted_invoice_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-400 hover:text-blue-300 underline"
                          >
                            View in Stripe
                          </a>
                        )}
                        {invoice.invoice_pdf && (
                          <a
                            href={invoice.invoice_pdf}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-400 hover:text-blue-300 underline"
                          >
                            Download PDF
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <DrawerFooter>
              <DrawerClose asChild>
                <Button variant="outline" className="bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700">
                  Close
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}

export default CustomerPaymentTimeline;