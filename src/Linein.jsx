import React, { useState, useEffect } from "react";
import { useGlobalContext } from "./GlobalProvider";
import { Bar, BarChart, CartesianGrid, XAxis, LabelList } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  count: {
    label: "Count",
    color: "hsl(var(--chart-1))",
  },
};

function Linein() {
  const { shipments, users, subscriptions, invoices,subscriptionsreal } = useGlobalContext();

  const [invoicesFiltered, setInvoicesFiltered] = useState([]);

  useEffect(() => {
    if (invoices && invoices.length > 0) {
      // Filter out invoices where amount_paid is 0
      const filteredInvoices = invoices.filter(invoice => invoice.amount_paid !== 0);
  
      const groupedInvoices = filteredInvoices.reduce((acc, invoice) => {
        const { customer_name, status_transitions } = invoice;
        const existingCustomer = acc.find((entry) => entry.NAME === customer_name);
  
        if (existingCustomer) {
          existingCustomer.DATES.push(status_transitions.paid_at);
        } else {
          acc.push({
            NAME: customer_name,
            DATES: [status_transitions.paid_at],
          });
        }
  
        return acc;
      }, []);
  
      // Iterate over all the dates for each customer
      const formattedInvoices = groupedInvoices.map((entry) => ({
        NAME: entry.NAME,
        DATES: entry.DATES.map(formatDate), // Format all dates
      }));
  
      setInvoicesFiltered(formattedInvoices);
    }
  }, [invoices]);
  
  // Helper function to format date (epoch to dd-mm-yyyy)
  const formatDate = (epoch) => {
    const date = new Date(epoch * 1000); // Convert epoch to milliseconds
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };
  const prepareChartData = (invoices) => {
    const monthCounts = invoices.reduce((acc, { DATES }) => {
      // Ensure DATES is an array
      const datesArray = Array.isArray(DATES) ? DATES : [DATES];
  
      datesArray.forEach((date) => {
        const [day, month, year] = date.split("-");
        const monthYear = `${month}-${year}`;
        acc[monthYear] = (acc[monthYear] || 0) + 1;
      });
  
      return acc;
    }, {});
  
    return Object.entries(monthCounts)
      .map(([key, value]) => ({
        month: key,
        count: value,
      }))
      .sort((a, b) => new Date(`01-${b.month}`) - new Date(`01-${a.month}`)); // Reverse order
  };
  

  const formatMonthYear = (monthYear) => {
    const [month, year] = monthYear.split("-");
    const date = new Date(`${year}-${month}-01`);
    return date.toLocaleString("default", { month: "short", year: "2-digit" });
  };

  const chartData = prepareChartData(invoicesFiltered);

  return (
    <div className="text-white">
      <Card className="dark">
        <CardHeader>
          <CardTitle>Invoices Count</CardTitle>
          <CardDescription>Number of customers which invoice was created for them (paid_at)</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={chartConfig}
            className="max-w-[900px] h-[250px]"
          >
            <BarChart
              data={chartData}
              layout="horizontal"
          
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                reversed={true}
                tickFormatter={(value) => formatMonthYear(value)}
              />
               <ChartTooltip
              content={<ChartTooltipContent />}
              cursor={false}
           
            />
              <Bar dataKey="count" fill="var(--color-count)" radius={4}>
                <LabelList
                  dataKey="count"
                  position="top"
                  fill="#fff"
                  fontSize={12}
                  fontWeight="bold"
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}

export default Linein;
