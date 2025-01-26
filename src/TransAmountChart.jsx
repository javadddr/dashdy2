import React, { useState, useEffect } from "react";
import { useGlobalContext } from "./GlobalProvider";
import { Bar, BarChart, CartesianGrid, XAxis, LabelList } from "recharts";
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
} from "@/components/ui/chart";

const chartConfig = {
  transactions: {
    label: "Transactions",
    color: "hsl(var(--chart-4))",
  },
};

function TransAmountChart() {

  const { transactions } = useGlobalContext();
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (transactions && transactions.length > 0) {
      const filteredTransactions = transactions.filter(
        (transaction) => transaction.paid
      );

      const groupedData = filteredTransactions.reduce((acc, transaction) => {
        const date = new Date(transaction.created * 1000); // Convert epoch to milliseconds
        const monthYear = `${String(date.getMonth() + 1).padStart(2, "0")}-${date.getFullYear()}`;

        if (!acc[monthYear]) {
          acc[monthYear] = 0;
        }
        acc[monthYear] += 1; // Increment the count of transactions

        return acc;
      }, {});

      const formattedData = Object.entries(groupedData)
        .map(([month, count]) => ({ month, count }))
        .sort((a, b) => new Date(`01-${b.month}`) - new Date(`01-${a.month}`)); // Sort by date descending

      setChartData(formattedData);
    }
  }, [transactions]);

  const formatMonthYear = (monthYear) => {
    const [month, year] = monthYear.split("-");
    const date = new Date(`${year}-${month}-01`);
    return date.toLocaleString("default", { month: "short", year: "2-digit" });
  };

  return (
    <div className="text-white">
      <Card className="dark">
        <CardHeader>
          <CardTitle>Transactions Count</CardTitle>
          <CardDescription>
            Number of paid transactions (grouped by month)
          </CardDescription>
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
              <Bar dataKey="count" fill="var(--color-transactions)" radius={4}>
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

export default TransAmountChart;
