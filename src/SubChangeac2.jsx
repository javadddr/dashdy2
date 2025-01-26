import React, { useState, useEffect } from "react";
import { useGlobalContext } from "./GlobalProvider";
import { LineChart, Line, CartesianGrid, XAxis, LabelList } from "recharts";
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
  subscriptions: {
    label: "Active Subscriptions",
    color: "hsl(var(--chart-5))",
  },
};

function SubChangeac2() {
  const { shipments, users, subscriptions, invoices,subscriptionsreal,allsubs } = useGlobalContext();
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (allsubs && allsubs.length > 0) {
      const activeSubs = allsubs.filter((sub) => sub.status === "canceled");

      const groupedData = activeSubs.reduce((acc, sub) => {
        const date = new Date(sub.created * 1000); // Convert epoch to milliseconds
        const monthYear = `${String(date.getMonth() + 1).padStart(2, "0")}-${date.getFullYear()}`;

        if (!acc[monthYear]) {
          acc[monthYear] = 0;
        }
        acc[monthYear]++;

        return acc;
      }, {});

      const formattedData = Object.entries(groupedData)
        .map(([month, count]) => ({ month, count }))
        .sort((a, b) => new Date(`01-${a.month}`) - new Date(`01-${b.month}`)); // Sort by date ascending

      // Accumulate the count for each month
      let cumulativeCount = 0;
      const cumulativeData = formattedData.map((data) => {
        cumulativeCount += data.count; // Add current count to cumulative total
        return { ...data, count: cumulativeCount }; // Replace count with cumulative count
      });

      setChartData(cumulativeData); // Set the updated data with cumulative counts
    }
  }, [allsubs]);

  const formatMonthYear = (monthYear) => {
    const [month, year] = monthYear.split("-");
    const date = new Date(`${year}-${month}-01`);
    return date.toLocaleString("default", { month: "short", year: "2-digit" });
  };

  return (
    <div className="text-white h-[250px] ">
      <Card className="dark">
        <CardHeader>
          <CardTitle>Active Subscriptions Lost</CardTitle>
          <CardDescription>
            Total active subscriptions grouped by month
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={chartConfig}
            className="max-w-[900px] h-[180px]"
          >
            <LineChart
              data={chartData}
              layout="horizontal"
              margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
              accessibilityLayer
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                reversed={false}
                tickFormatter={(value) => formatMonthYear(value)}
              />
              <ChartTooltip
                content={<ChartTooltipContent />}
                cursor={false}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="var(--color-subscriptions)"
                strokeWidth={2}
                dot={{ fill: "var(--color-subscriptions)" }}
                activeDot={{ r: 6 }}
              >
                <LabelList
                  dataKey="count"
                  position="top"
                  fill="#fff"
                  fontSize={12}
                  fontWeight="bold"
                />
              </Line>
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}

export default SubChangeac2;
