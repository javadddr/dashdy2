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

// Helper to extract email from message
const extractEmail = (message) => {
  const emailEntity = message.text_entities?.find(entity => entity.type === "email");
  return emailEntity ? emailEntity.text : null;
};

// Helper to extract plan info and monthly price from message
const extractPlanAndMonthlyPrice = (message) => {
  const boldTexts = message.text_entities?.filter(entity => entity.type === "bold");
  const planText = boldTexts?.find(bold => 
    bold.text.includes("Plan") || bold.text.includes("plan")
  );
  
  // Extract price (look for $ sign in bold texts)
  const priceText = boldTexts?.find(bold => 
    bold.text.includes("$")
  );
  
  let priceAmount = 0;
  let priceDisplay = "0$";
  let isYearly = false;
  let isOneTime = false;
  let monthlyPrice = 0;
  
  if (priceText) {
    priceDisplay = priceText.text;
    // Extract number from string like "79$" or "408$"
    const match = priceText.text.match(/(\d+)/);
    if (match) {
      priceAmount = parseInt(match[0]);
      
      // Check if it's a one-time payment (no plan name or no recurring indicator)
      if (!planText || (!planText.text.toLowerCase().includes("plan") && !planText.text.toLowerCase().includes("month") && !planText.text.toLowerCase().includes("year") && !planText.text.toLowerCase().includes("annual"))) {
        isOneTime = true;
        monthlyPrice = 0; // One-time payments don't contribute to MRR
      }
      // Check if it's a yearly plan
      else if (planText && (planText.text.toLowerCase().includes("year") || planText.text.toLowerCase().includes("annual"))) {
        isYearly = true;
        monthlyPrice = Math.floor(priceAmount / 12); // Convert yearly to monthly
      }
      // Monthly plan
      else {
        monthlyPrice = priceAmount;
      }
    }
  }
  
  return {
    plan: planText ? planText.text : (isOneTime ? "One Time Payment" : "Unknown Plan"),
    price: priceDisplay,
    priceAmount: priceAmount,
    monthlyPrice: monthlyPrice,
    isYearly: isYearly,
    isOneTime: isOneTime
  };
};

// Helper to extract price from message
const extractPrice = (message) => {
  const boldTexts = message.text_entities?.filter(entity => entity.type === "bold");
  const priceText = boldTexts?.find(bold => bold.text.includes("$"));
  if (priceText) {
    const match = priceText.text.match(/(\d+)/);
    return match ? parseInt(match[0]) : 0;
  }
  return 0;
};

// Helper to check if plan is yearly
const isYearlyPlan = (message) => {
  const boldTexts = message.text_entities?.filter(entity => entity.type === "bold");
  const planText = boldTexts?.find(bold => 
    bold.text.includes("Plan") || bold.text.includes("plan")
  );
  return planText && (planText.text.toLowerCase().includes("year") || planText.text.toLowerCase().includes("annual"));
};

// Helper to check if it's a one-time payment
const isOneTimePayment = (message) => {
  const boldTexts = message.text_entities?.filter(entity => entity.type === "bold");
  const planText = boldTexts?.find(bold => 
    bold.text.includes("Plan") || bold.text.includes("plan")
  );
  const priceText = boldTexts?.find(bold => bold.text.includes("$"));
  
  // If there's a price but no plan or no recurring keywords, it's one-time
  if (priceText && !planText) return true;
  if (priceText && planText && !planText.text.toLowerCase().includes("month") && !planText.text.toLowerCase().includes("year") && !planText.text.toLowerCase().includes("annual")) {
    return true;
  }
  return false;
};

// Helper to get month-year from date
const getMonthYear = (dateString) => {
  const date = new Date(dateString);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
};

// Helper to format month display
const formatMonth = (monthYear) => {
  const [year, month] = monthYear.split("-");
  const date = new Date(`${year}-${month}-01`);
  return date.toLocaleString("default", { month: "long", year: "numeric" });
};

function CustomerSubscriptionTable() {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/result.json');
        const data = await response.json();
        
        const messages = Array.isArray(data) ? data : data.messages || [];
        
        // Track customer subscriptions
        const customerSubscriptions = new Map(); // email -> { startDate, lastPaymentDate, plan, price, monthlyPrice, isYearly, isOneTime }
        const monthlyData = new Map(); // monthYear -> { gained: [], lost: [], gainedAmount: 0, lostAmount: 0, gainedMRR: 0, lostMRR: 0 }
        
        // First, process all payment messages in chronological order
        const paymentMessages = messages
          .filter(msg => {
            const firstText = msg.text?.[0];
            return msg.type === "message" && firstText?.type === "bold" && firstText?.text === "New Payment";
          })
          .sort((a, b) => new Date(a.date) - new Date(b.date));
        
        // Track all months that appear
        const allMonths = new Set();
        
        paymentMessages.forEach(message => {
          const email = extractEmail(message);
          const paymentDate = message.date;
          const monthYear = getMonthYear(paymentDate);
          const { plan, price, priceAmount, monthlyPrice, isYearly, isOneTime } = extractPlanAndMonthlyPrice(message);
          
          allMonths.add(monthYear);
          
          if (!customerSubscriptions.has(email)) {
            // New customer
            customerSubscriptions.set(email, {
              startDate: paymentDate,
              lastPaymentDate: paymentDate,
              plan: plan,
              price: price,
              priceAmount: priceAmount,
              monthlyPrice: monthlyPrice,
              isYearly: isYearly,
              isOneTime: isOneTime,
              active: !isOneTime // One-time payments don't track as active subscribers
            });
            
            // Record gain for this month
            if (!monthlyData.has(monthYear)) {
              monthlyData.set(monthYear, { gained: [], lost: [], gainedAmount: 0, lostAmount: 0, gainedMRR: 0, lostMRR: 0 });
            }
            monthlyData.get(monthYear).gained.push({ 
              email, 
              plan, 
              price, 
              priceAmount,
              monthlyPrice,
              isYearly,
              isOneTime,
              date: paymentDate 
            });
            monthlyData.get(monthYear).gainedAmount += priceAmount;
            // Only add to MRR if it's not a one-time payment
            if (!isOneTime) {
              monthlyData.get(monthYear).gainedMRR += monthlyPrice;
            }
          } else {
            // Existing customer - update last payment date
            const customer = customerSubscriptions.get(email);
            // Don't update one-time payments
            if (!customer.isOneTime) {
              customer.lastPaymentDate = paymentDate;
              customer.active = true;
              customerSubscriptions.set(email, customer);
            }
          }
        });
        
        // Sort months chronologically
        const sortedMonths = Array.from(allMonths).sort();
        
        // Track active customers over time (excluding one-time payments)
        let activeCustomers = new Map(); // email -> { plan, startDate, price, monthlyPrice, isYearly }
        const monthlyStats = [];
        
        for (let i = 0; i < sortedMonths.length; i++) {
          const month = sortedMonths[i];
          const monthData = monthlyData.get(month) || { gained: [], lost: [], gainedAmount: 0, lostAmount: 0, gainedMRR: 0, lostMRR: 0 };
          
          // Check for lost customers (no payment in last 60 days) - excluding one-time payments
          const currentDate = new Date(`${month}-01`);
          const lostThisMonth = [];
          let lostAmountThisMonth = 0;
          let lostMRRThisMonth = 0;
          
          activeCustomers.forEach((customerInfo, email) => {
            const customer = customerSubscriptions.get(email);
            const lastPayment = new Date(customer.lastPaymentDate);
            const daysSinceLastPayment = Math.floor((currentDate - lastPayment) / (1000 * 60 * 60 * 24));
            
            // Consider customer lost if no payment for 60+ days
            if (daysSinceLastPayment > 60 && !customer.isOneTime) {
              customer.active = false;
              lostThisMonth.push({ 
                email, 
                plan: customer.plan, 
                price: customer.price,
                priceAmount: customer.priceAmount,
                monthlyPrice: customer.monthlyPrice,
                isYearly: customer.isYearly,
                isOneTime: customer.isOneTime,
                lastPaymentDate: customer.lastPaymentDate 
              });
              lostAmountThisMonth += customer.priceAmount;
              lostMRRThisMonth += customer.monthlyPrice;
            }
          });
          
          // Remove lost customers from active set
          lostThisMonth.forEach(lost => activeCustomers.delete(lost.email));
          
          // Add newly gained customers to active set (excluding one-time payments)
          monthData.gained.forEach(gained => {
            if (!gained.isOneTime) {
              activeCustomers.set(gained.email, {
                plan: gained.plan,
                startDate: gained.date,
                price: gained.price,
                monthlyPrice: gained.monthlyPrice,
                isYearly: gained.isYearly
              });
            }
          });
          
          // Store monthly stats with email details
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
        console.error("Error loading data:", error);
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  if (loading) {
    return (
      <Card className="dark">
        <CardHeader>
          <CardTitle>Customer Subscription History</CardTitle>
          <CardDescription>Loading customer data...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (tableData.length === 0) {
    return (
      <Card className="dark">
        <CardHeader>
          <CardTitle>Customer Subscription History</CardTitle>
          <CardDescription>No payment data available</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="text-white">
      <Card className="">
        <CardHeader>
          <CardTitle>Customer Subscription History</CardTitle>
          <CardDescription>
            Monthly breakdown of customer gains and losses with email details and MRR (Monthly Recurring Revenue)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border ">
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
                              <div className="text-green-400 font-medium">{customer.email}</div>
                              <div className="text-xs text-gray-400">
                                {customer.plan} • {customer.price}
                                {customer.isYearly && " (Yearly - Converted to Monthly)"}
                                {customer.isOneTime && " (One Time Payment)"}
                              </div>
                              <div className="text-xs text-gray-500">
                                Started: {new Date(customer.date).toLocaleDateString()}
                                {!customer.isOneTime && ` • MRR: $${customer.monthlyPrice}/month`}
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
                              <div className="text-red-400 font-medium">{customer.email}</div>
                              <div className="text-xs text-gray-400">
                                {customer.plan} • {customer.price}
                                {customer.isYearly && " (Yearly - Converted to Monthly)"}
                                {customer.isOneTime && " (One Time Payment)"}
                              </div>
                              <div className="text-xs text-gray-500">
                                Last paid: {new Date(customer.lastPaymentDate).toLocaleDateString()}
                                {!customer.isOneTime && ` • MRR: $${customer.monthlyPrice}/month`}
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

export default CustomerSubscriptionTable;