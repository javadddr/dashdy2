import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGlobalContext } from "./GlobalProvider";

// Helper to get month-year from timestamp
const getMonthYearFromTimestamp = (timestamp) => {
  const date = new Date(timestamp * 1000);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
};

// Helper to format month display
const formatMonth = (monthYear) => {
  const [year, month] = monthYear.split("-");
  const date = new Date(`${year}-${month}-01`);
  return date.toLocaleString("default", { month: "long", year: "numeric" });
};

// Helper to extract monthly price from invoice
const extractMonthlyPrice = (invoice) => {
  // Get the subscription item from lines
  const lineItem = invoice.lines?.data?.[0];
  
  if (!lineItem) return 0;
  
  const price = lineItem.price;
  if (!price) return 0;
  
  const unitAmount = price.unit_amount || 0;
  const currency = price.currency || 'usd';
  
  // Check if it's a yearly plan
  const isYearly = price.recurring?.interval === 'year';
  const monthlyPrice = isYearly ? Math.floor(unitAmount / 100 / 12) : unitAmount / 100;
  
  return {
    amount: unitAmount / 100,
    monthlyAmount: monthlyPrice,
    currency: currency,
    interval: price.recurring?.interval || 'one_time',
    isYearly: isYearly,
    planName: price.nickname || lineItem.description || "Subscription Plan"
  };
};

// Helper to check if invoice is a new subscription (first payment)
const isNewSubscription = (invoice, customerInvoices) => {
  const customerEmail = invoice.customer_email;
  const currentDate = invoice.created;
  
  // Find all invoices for this customer
  const customerHistory = customerInvoices
    .filter(inv => inv.customer_email === customerEmail)
    .sort((a, b) => a.created - b.created);
  
  // If this is the first invoice for this customer
  return customerHistory[0]?.id === invoice.id;
};

function CustomerSubscriptionInvoiceTable() {
  const { invoices } = useGlobalContext();
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);

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
      
      // Track customer subscriptions
      const customerSubscriptions = new Map(); // email -> { startDate, lastPaymentDate, plan, monthlyPrice, amount }
      const monthlyData = new Map(); // monthYear -> { gained: [], lost: [], gainedAmount: 0, lostAmount: 0, gainedMRR: 0, lostMRR: 0 }
      
      // Sort invoices by date
      const sortedInvoices = [...paidInvoices].sort((a, b) => a.created - b.created);
      
      // Track all months that appear
      const allMonths = new Set();
      
      sortedInvoices.forEach(invoice => {
        const email = invoice.customer_email;
        const customerName = invoice.customer_name;
        const paymentDate = invoice.created;
        const monthYear = getMonthYearFromTimestamp(paymentDate);
        const { amount, monthlyAmount, currency, interval, isYearly, planName } = extractMonthlyPrice(invoice);
        const isNew = isNewSubscription(invoice, paidInvoices);
        
        allMonths.add(monthYear);
        
        if (isNew || !customerSubscriptions.has(email)) {
          // New customer or first payment
          customerSubscriptions.set(email, {
            startDate: paymentDate,
            lastPaymentDate: paymentDate,
            planName: planName,
            amount: amount,
            monthlyAmount: interval === 'one_time' ? 0 : monthlyAmount,
            interval: interval,
            isYearly: isYearly,
            currency: currency,
            active: interval !== 'one_time'
          });
          
          // Record gain for this month
          if (!monthlyData.has(monthYear)) {
            monthlyData.set(monthYear, { gained: [], lost: [], gainedAmount: 0, lostAmount: 0, gainedMRR: 0, lostMRR: 0 });
          }
          monthlyData.get(monthYear).gained.push({ 
            email,
            customerName,
            planName,
            amount,
            monthlyAmount: interval === 'one_time' ? 0 : monthlyAmount,
            interval,
            isYearly,
            currency,
            date: paymentDate 
          });
          monthlyData.get(monthYear).gainedAmount += amount;
          if (interval !== 'one_time') {
            monthlyData.get(monthYear).gainedMRR += monthlyAmount;
          }
        } else {
          // Existing customer - update last payment date
          const customer = customerSubscriptions.get(email);
          customer.lastPaymentDate = paymentDate;
          customer.active = true;
          customerSubscriptions.set(email, customer);
        }
      });
      
      // Sort months chronologically
      const sortedMonths = Array.from(allMonths).sort();
      
      // Track active customers over time (excluding one-time)
      let activeCustomers = new Map();
      const monthlyStats = [];
      
      for (let i = 0; i < sortedMonths.length; i++) {
        const month = sortedMonths[i];
        const monthData = monthlyData.get(month) || { gained: [], lost: [], gainedAmount: 0, lostAmount: 0, gainedMRR: 0, lostMRR: 0 };
        
        // Check for lost customers (no payment in last 60 days)
        const currentDate = new Date(`${month}-01`);
        const lostThisMonth = [];
        let lostAmountThisMonth = 0;
        let lostMRRThisMonth = 0;
        
        activeCustomers.forEach((customerInfo, email) => {
          const customer = customerSubscriptions.get(email);
          const lastPayment = new Date(customer.lastPaymentDate * 1000);
          const daysSinceLastPayment = Math.floor((currentDate - lastPayment) / (1000 * 60 * 60 * 24));
          
          // Consider customer lost if no payment for 60+ days
          if (daysSinceLastPayment > 60 && customer.interval !== 'one_time') {
            customer.active = false;
            lostThisMonth.push({ 
              email,
              customerName: customer.customerName,
              planName: customer.planName,
              amount: customer.amount,
              monthlyAmount: customer.monthlyAmount,
              interval: customer.interval,
              isYearly: customer.isYearly,
              currency: customer.currency,
              lastPaymentDate: customer.lastPaymentDate
            });
            lostAmountThisMonth += customer.amount;
            lostMRRThisMonth += customer.monthlyAmount;
          }
        });
        
        // Remove lost customers from active set
        lostThisMonth.forEach(lost => activeCustomers.delete(lost.email));
        
        // Add newly gained customers to active set (excluding one-time)
        monthData.gained.forEach(gained => {
          if (gained.interval !== 'one_time') {
            activeCustomers.set(gained.email, {
              customerName: gained.customerName,
              planName: gained.planName,
              startDate: gained.date,
              amount: gained.amount,
              monthlyAmount: gained.monthlyAmount,
              currency: gained.currency
            });
          }
        });
        
        // Store monthly stats
        monthlyStats.push({
          month: month,
          monthFormatted: formatMonth(month),
          gained: monthData.gained,
          lost: lostThisMonth,
          gainedCount: monthData.gained.length,
          lostCount: lostThisMonth.length,
          gainedAmount: monthData.gainedAmount,
          lostAmount: lostAmountThisMonth,
          gainedMRR: monthData.gainedMRR,
          lostMRR: lostMRRThisMonth,
          totalCount: activeCustomers.size,
        });
      }
      
      setTableData(monthlyStats);
      setLoading(false);
    } catch (error) {
      console.error("Error processing invoices:", error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="dark">
        <CardHeader>
          <CardTitle>Customer Subscription History (Invoices)</CardTitle>
          <CardDescription>Loading invoice data...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (tableData.length === 0) {
    return (
      <Card className="dark">
        <CardHeader>
          <CardTitle>Customer Subscription History (Invoices)</CardTitle>
          <CardDescription>No invoice data available</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="text-white">
      <Card className="">
        <CardHeader>
          <CardTitle>Customer Subscription History (Invoices)</CardTitle>
          <CardDescription>
            Monthly breakdown of customer gains and losses based on Stripe invoices with MRR (Monthly Recurring Revenue)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-gray-700 hover:bg-transparent">
                  <TableHead className="text-gray-700 font-semibold w-[200px]">Month</TableHead>
                  <TableHead className="text-gray-700 font-semibold">Customers Gained</TableHead>
                  <TableHead className="text-gray-700 font-semibold">Customers Lost</TableHead>
                  <TableHead className="text-gray-700 font-semibold text-right">Net Change</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tableData.map((row) => (
                  <TableRow key={row.month} className="border-b border-gray-700">
                    <TableCell className="font-medium text-gray-900 align-top">
                      {row.monthFormatted}
                      <div className="text-xs text-gray-400 mt-1">
                        Total Active: {row.totalCount}
                      </div>
                    </TableCell>
                    
                    <TableCell className="align-top">
                      {row.gained.length > 0 ? (
                        <div className="space-y-2">
                          {row.gained.map((customer, idx) => (
                            <div key={idx} className="text-sm">
                              <div className="text-green-400 font-medium">
                                {customer.customerName || customer.email}
                              </div>
                              <div className="text-xs text-gray-400">
                                {customer.email}
                              </div>
                              <div className="text-xs text-gray-400">
                                {customer.planName} • ${customer.amount} {customer.currency.toUpperCase()}
                                {customer.isYearly && " (Yearly)"}
                                {customer.interval === 'one_time' && " (One Time Payment)"}
                              </div>
                              <div className="text-xs text-gray-500">
                                Started: {new Date(customer.date * 1000).toLocaleDateString()}
                                {customer.interval !== 'one_time' && ` • MRR: $${customer.monthlyAmount}/month`}
                              </div>
                            </div>
                          ))}
                          <div className="text-xs text-green-400 font-semibold pt-2">
                            Total Revenue: +${row.gainedAmount}
                          </div>
                          {row.gainedMRR > 0 && (
                            <div className="text-xs text-green-400 font-semibold">
                              Added MRR: +${row.gainedMRR}/month
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-gray-500 text-sm italic">No new customers</div>
                      )}
                    </TableCell>
                    
                    <TableCell className="align-top">
                      {row.lost.length > 0 ? (
                        <div className="space-y-2">
                          {row.lost.map((customer, idx) => (
                            <div key={idx} className="text-sm">
                              <div className="text-red-400 font-medium">
                                {customer.customerName || customer.email}
                              </div>
                              <div className="text-xs text-gray-400">
                                {customer.email}
                              </div>
                              <div className="text-xs text-gray-400">
                                {customer.planName} • ${customer.amount} {customer.currency.toUpperCase()}
                                {customer.isYearly && " (Yearly)"}
                              </div>
                              <div className="text-xs text-gray-500">
                                Last paid: {new Date(customer.lastPaymentDate * 1000).toLocaleDateString()}
                                {customer.interval !== 'one_time' && ` • MRR: $${customer.monthlyAmount}/month`}
                              </div>
                            </div>
                          ))}
                          <div className="text-xs text-red-400 font-semibold pt-2">
                            Lost Revenue: -${row.lostAmount}
                          </div>
                          {row.lostMRR > 0 && (
                            <div className="text-xs text-red-400 font-semibold">
                              Lost MRR: -${row.lostMRR}/month
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-gray-500 text-sm italic">No customers lost</div>
                      )}
                    </TableCell>
                    
                    <TableCell className="text-right align-top">
                      <div className={`font-bold text-lg ${row.gainedCount - row.lostCount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {row.gainedCount - row.lostCount >= 0 ? '+' : ''}{row.gainedCount - row.lostCount}
                      </div>
                      <div className="text-md font-bold text-gray-900 mt-1">
                        +{row.gainedCount} / -{row.lostCount}
                      </div>
                      <div className={`text-sm font-semibold mt-2 ${row.gainedAmount - row.lostAmount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        ${row.gainedAmount - row.lostAmount >= 0 ? '+' : ''}{row.gainedAmount - row.lostAmount}
                      </div>
                      {(row.gainedMRR - row.lostMRR !== 0) && (
                        <div className={`text-sm font-semibold mt-1 ${row.gainedMRR - row.lostMRR >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          MRR: ${row.gainedMRR - row.lostMRR >= 0 ? '+' : ''}{row.gainedMRR - row.lostMRR}/month
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default CustomerSubscriptionInvoiceTable;