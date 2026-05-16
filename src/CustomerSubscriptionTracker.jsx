import React, { useState, useEffect } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, Line, ComposedChart } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";

// Helper to extract email from message
const extractEmail = (message) => {
  const emailEntity = message.text_entities?.find(entity => entity.type === "email");
  return emailEntity ? emailEntity.text : null;
};

// Helper to extract plan info from message
const extractPlan = (message) => {
  const boldTexts = message.text_entities?.filter(entity => entity.type === "bold");
  const planText = boldTexts?.find(bold => 
    bold.text.includes("Plan") || bold.text.includes("plan")
  );
  return planText ? planText.text : "Unknown Plan";
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
  return date.toLocaleString("default", { month: "short", year: "numeric" });
};

const chartConfig = {
  gained: {
    label: "Customers Gained",
    color: "hsl(142, 76%, 36%)",
  },
  lost: {
    label: "Customers Lost",
    color: "hsl(0, 72%, 51%)",
  },
  total: {
    label: "Total Active Customers",
    color: "hsl(221, 83%, 53%)",
  },
};

function CustomerSubscriptionTracker() {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/result.json');
        const data = await response.json();
        
        const messages = Array.isArray(data) ? data : data.messages || [];
        
        // Track customer subscriptions
        const customerSubscriptions = new Map(); // email -> { startDate, lastPaymentDate, plan }
        const monthlyData = new Map(); // monthYear -> { gained: [], lost: [] }
        
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
          const plan = extractPlan(message);
          
          allMonths.add(monthYear);
          
          if (!customerSubscriptions.has(email)) {
            // New customer
            customerSubscriptions.set(email, {
              startDate: paymentDate,
              lastPaymentDate: paymentDate,
              plan: plan,
              active: true
            });
            
            // Record gain for this month
            if (!monthlyData.has(monthYear)) {
              monthlyData.set(monthYear, { gained: [], lost: [] });
            }
            monthlyData.get(monthYear).gained.push(email);
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
        
        // Track active customers over time
        let activeCustomers = new Set();
        const monthlyStats = [];
        
        for (let i = 0; i < sortedMonths.length; i++) {
          const month = sortedMonths[i];
          const monthData = monthlyData.get(month) || { gained: [], lost: [] };
          
          // Check for lost customers (no payment in last 60 days)
          const currentDate = new Date(`${month}-01`);
          const lostThisMonth = [];
          
          activeCustomers.forEach(email => {
            const customer = customerSubscriptions.get(email);
            const lastPayment = new Date(customer.lastPaymentDate);
            const daysSinceLastPayment = Math.floor((currentDate - lastPayment) / (1000 * 60 * 60 * 24));
            
            // Consider customer lost if no payment for 60+ days
            if (daysSinceLastPayment > 60) {
              customer.active = false;
              lostThisMonth.push(email);
            }
          });
          
          // Remove lost customers from active set
          lostThisMonth.forEach(email => activeCustomers.delete(email));
          
          // Add newly gained customers
          monthData.gained.forEach(email => activeCustomers.add(email));
          
          // Store monthly stats
          monthlyStats.push({
            month: month,
            gained: monthData.gained.length,
            lost: lostThisMonth.length,
            total: activeCustomers.size,
          });
        }
        
        setChartData(monthlyStats);
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
          <CardTitle>Customer Subscription Trends</CardTitle>
          <CardDescription>Loading customer data...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (chartData.length === 0) {
    return (
      <Card className="dark">
        <CardHeader>
          <CardTitle>Customer Subscription Trends</CardTitle>
          <CardDescription>No payment data available</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="text-white">
      <Card className="">
        <CardHeader>
          <CardTitle>Customer Subscription Trends</CardTitle>
          <CardDescription>
            Track customer gains, losses, and total active subscribers over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={chartConfig}
            className="min-w-[1330px] h-[400px]"
          >
            <ComposedChart
              data={chartData}
              margin={{ left: 12, right: 12, top: 12 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => formatMonth(value)}
              />
              <ChartTooltip
                cursor={true}
                content={<ChartTooltipContent indicator="line" />}
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Area
                type="monotone"
                dataKey="gained"
                fill="var(--color-gained)"
                fillOpacity={0.1}
                stroke="var(--color-gained)"
                strokeWidth={2}
                name="gained"
              />
              <Area
                type="monotone"
                dataKey="lost"
                fill="var(--color-lost)"
                fillOpacity={0.1}
                stroke="var(--color-lost)"
                strokeWidth={2}
                name="lost"
              />
              <Line
                type="monotone"
                dataKey="total"
                stroke="var(--color-total)"
                strokeWidth={3}
                dot={{ fill: "var(--color-total)", r: 4 }}
                activeDot={{ r: 6 }}
                name="total"
              />
            </ComposedChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}

export default CustomerSubscriptionTracker;