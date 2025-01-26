import React, { useState, useEffect } from "react";
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
import { useGlobalContext } from "./GlobalProvider";
const chartConfig = {
  count: {
    label: "Users",
    color: "hsl(var(--chart-5))",
  },
};

function Overall() {
  const [chartData, setChartData] = useState([]);
  const { shipments, users, subscriptions, invoices,subscriptionsreal } = useGlobalContext();
  useEffect(() => {
    if (users && users.length > 0) {
      const groupedData = users.reduce((acc, user) => {
        const createdAtDate = new Date(user.createdAt);
        const monthYear = `${String(createdAtDate.getMonth() + 1).padStart(
          2,
          "0"
        )}-${createdAtDate.getFullYear()}`;

        if (!acc[monthYear]) {
          acc[monthYear] = 0;
        }
        acc[monthYear] += 1;

        return acc;
      }, {});

      const formattedData = Object.entries(groupedData)
        .map(([month, count]) => ({ month, count }))
        .sort((a, b) => new Date(`01-${b.month}`) - new Date(`01-${a.month}`)); // Sort by date descending

      setChartData(formattedData);
    }
  }, [users]);

  const formatMonthYear = (monthYear) => {
    const [month, year] = monthYear.split("-");
    const date = new Date(`${year}-${month}-01`);
    return date.toLocaleString("default", { month: "short", year: "2-digit" });
  };

  return (
    <div className="text-white">
      <Card className="dark">
        <CardHeader>
          <CardTitle>User Signup Trends</CardTitle>
          <CardDescription>
            Number of users grouped by signup month
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={chartConfig}
            className="min-w-[1330px] h-[380px]"
          >
            <BarChart data={chartData} layout="horizontal">
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                reversed={true}
                tickFormatter={(value) => formatMonthYear(value)}
              />
              <ChartTooltip content={<ChartTooltipContent />} cursor={false} />
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

export default Overall;
