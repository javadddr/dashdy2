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

// Helper to get subscription type from invoice line items
const getSubscriptionType = (invoices) => {
  if (!invoices || invoices.length === 0) return 'other';
  
  for (const invoice of invoices) {
    if (invoice.lines?.data) {
      for (const line of invoice.lines.data) {
        const interval = line.price?.recurring?.interval;
        if (interval === 'month') return 'monthly';
        if (interval === 'quarter') return 'quarterly';
        if (interval === 'year') return 'yearly';
      }
    }
  }
  return 'one_time';
};

// Helper to get color based on subscription type
const getCellColor = (subscriptionType, hasPaid) => {
  if (!hasPaid) return 'bg-gray-800/30 text-gray-600 hover:bg-gray-700/50';
  
  switch (subscriptionType) {
    case 'monthly':
      return 'bg-blue-600/80 text-white font-medium hover:bg-blue-500 hover:scale-105';
    case 'quarterly':
      return 'bg-purple-600/80 text-white font-medium hover:bg-purple-500 hover:scale-105';
    case 'yearly':
      return 'bg-emerald-600/80 text-white font-medium hover:bg-emerald-500 hover:scale-105';
    case 'one_time':
      return 'bg-orange-600/80 text-white font-medium hover:bg-orange-500 hover:scale-105';
    default:
      return 'bg-red-600/80 text-white font-medium hover:bg-red-500 hover:scale-105';
  }
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
      const customerPayments = new Map(); // email -> { customerName, payments: Map of month -> [invoices], lastPaymentDate, subscriptionType }
      
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
            payments: new Map(),
            lastPaymentDate: paymentDateObj,
            subscriptionType: null
          });
        }
        
        const customer = customerPayments.get(email);
        if (!customer.payments.has(monthYear)) {
          customer.payments.set(monthYear, []);
        }
        customer.payments.get(monthYear).push(invoice);
        
        // Update last payment date if this is more recent
        if (paymentDateObj > customer.lastPaymentDate) {
          customer.lastPaymentDate = paymentDateObj;
        }
      });
      
      // Determine subscription type for each customer and check if active
      const currentDateObj = new Date();
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      
      const customerArray = Array.from(customerPayments.values()).map(customer => {
        // Get subscription type from their most recent invoices
        const allInvoices = Array.from(customer.payments.values()).flat();
        const subscriptionType = getSubscriptionType(allInvoices);
        customer.subscriptionType = subscriptionType;
        
        // Check if customer is active (has payment in last 3 months)
        const isActive = customer.lastPaymentDate >= threeMonthsAgo;
        customer.isActive = isActive;
        
        return customer;
      });
      
      // Sort customers: Active first, then inactive sorted by last payment date (newest to oldest)
      const sortedCustomers = customerArray.sort((a, b) => {
        if (a.isActive && !b.isActive) return -1;
        if (!a.isActive && b.isActive) return 1;
        if (!a.isActive && !b.isActive) {
          return b.lastPaymentDate - a.lastPaymentDate;
        }
        return a.email.localeCompare(b.email);
      });
      
      // Include current month even if no invoices
      const endDate = new Date(currentDate);
      endDate.setMonth(endDate.getMonth());
      endDate.setDate(1);
      
      const months = getAllMonths(earliestDate, endDate);
      setAllMonths(months);
      
      setPaymentData(sortedCustomers);
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
              Monthly payment history - Active customers first, then inactive. Click on colored cells to view invoice details
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
                    {paymentData.map((customer) => {
                      // Find last payment month for inactive customers
                      let lastPaymentMonth = null;
                      if (!customer.isActive && customer.lastPaymentDate) {
                        lastPaymentMonth = getMonthYearFromTimestamp(customer.lastPaymentDate.getTime() / 1000);
                      }
                      
                      return (
                        <div key={customer.email} className="flex hover:bg-gray-800/30 transition-colors">
                          {/* Customer info column - sticky */}
                          <div className="w-[200px] flex-shrink-0 p-1.5 sticky left-0 bg-gray-900 border-r border-gray-700">
                            <div className="text-[11px] font-medium text-gray-200 truncate" title={customer.email}>
                              {customer.email}
                              {!customer.isActive && (
                                <span className="ml-1 text-[9px] text-gray-400">
                                  (Stopped: {formatMonthHeader(lastPaymentMonth)})
                                </span>
                              )}
                            </div>
                            {customer.customerName !== customer.email && (
                              <div className="text-[9px] text-gray-400 truncate">
                                {customer.customerName}
                              </div>
                            )}
                            <div className="text-[8px] text-gray-500 mt-0.5">
                              {customer.subscriptionType === 'monthly' && '📅 Monthly'}
                              {customer.subscriptionType === 'quarterly' && '📆 Quarterly'}
                              {customer.subscriptionType === 'yearly' && '📅 Yearly'}
                              {customer.subscriptionType === 'one_time' && '⚡ One Time'}
                              {customer.subscriptionType === 'other' && '📦 Other'}
                            </div>
                          </div>
                          
                          {/* Payment cells */}
                          <div className="flex">
                            {allMonths.map((month) => {
                              const invoicesInMonth = customer.payments.get(month);
                              const hasPaid = invoicesInMonth && invoicesInMonth.length > 0;
                              const cellColor = getCellColor(customer.subscriptionType, hasPaid);
                              
                              return (
                                <div
                                  key={`${customer.email}-${month}`}
                                  onClick={() => hasPaid && handleCellClick(customer, month, invoicesInMonth)}
                                  className={`w-[30px] flex-shrink-0 p-1.5 text-center text-[9px] border-r border-gray-700 transition-all cursor-pointer ${cellColor}`}
                                  title={
                                    hasPaid 
                                      ? `${invoicesInMonth.length} payment(s) in ${formatMonthHeader(month)} (${customer.subscriptionType}) - Click to view` 
                                      : `No payment in ${formatMonthHeader(month)}`
                                  }
                                >
                                  {hasPaid ? invoicesInMonth.length : '—'}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Legend */}
            <div className="mt-3 flex items-center gap-3 text-[10px] flex-wrap">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-blue-600/80 rounded"></div>
                <span className="text-gray-900 font-bold text-[12px]">Monthly Subscription</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-purple-600/80 rounded"></div>
                <span className="text-gray-900 font-bold text-[12px]">Quarterly Subscription</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-emerald-600/80 rounded"></div>
                <span className="text-gray-900 font-bold text-[12px]">Yearly Subscription</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-orange-600/80 rounded"></div>
                <span className="text-gray-900 font-bold text-[12px]">One Time Payment</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-gray-800/30 rounded"></div>
                <span className="text-gray-900 font-bold text-[12px]">No Payment</span>
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