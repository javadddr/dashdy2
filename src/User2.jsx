import React, { useState, useEffect } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, Legend, LabelList } from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"; // Ensure this path is correct
import { useGlobalContext } from "./GlobalProvider";

function User2() {
  const { userEvento } = useGlobalContext();
  const [chartData, setChartData] = useState([]);
  const [eventTypes, setEventTypes] = useState([]); // State to hold unique event types

  useEffect(() => {
    if (userEvento && userEvento.length > 0) {
      // Collect all unique eventTypes from userEvento
      const uniqueEventTypes = [...new Set(userEvento.map(event => event.event && event.event.eventType || 'unknown'))]
        .filter(type => type !== 'unknown'); // Filter out 'unknown' if you don't want to include it

      setEventTypes(uniqueEventTypes);

      const groupedData = userEvento.reduce((acc, event) => {
        const createdAtDate = new Date(event.createdAt);
        const monthYear = `${String(createdAtDate.getMonth() + 1).padStart(2, "0")}-${createdAtDate.getFullYear()}`;
        const eventType = event.event && event.event.eventType || 'unknown';

        if (!acc[monthYear]) {
          acc[monthYear] = uniqueEventTypes.reduce((init, type) => ({...init, [type]: new Set()}), {});
        }

        // Only process if eventType is defined and in our list
        if (uniqueEventTypes.includes(eventType)) {
          // Only add trackingId if it's unique for this eventType and month
          if (!acc[monthYear][eventType].has(event.trackingId)) {
            acc[monthYear][eventType].add(event.trackingId);
          }
        }

        return acc;
      }, {});

      const formattedData = Object.entries(groupedData)
        .map(([month, counts]) => ({
          month,
          ...Object.fromEntries(
            uniqueEventTypes.map(type => [type, counts[type] ? counts[type].size : 0])
          ),
          total: uniqueEventTypes.reduce((sum, type) => sum + (counts[type] ? counts[type].size : 0), 0)
        }))
        .sort((a, b) => new Date(`01-${b.month}`) - new Date(`01-${a.month}`));

      setChartData(formattedData);
    }
  }, [userEvento]);

  const chartConfig = eventTypes.reduce((acc, type, index) => {
    acc[type] = {
      label: type,
      color: `hsl(var(--chart-${(index % 5) + 1}))` // Cycle through 5 colors if more than 5 event types
    };
    return acc;
  }, {});

  const formatMonthYear = (monthYear) => {
    const [month, year] = monthYear.split("-");
    const date = new Date(`${year}-${month}-01`);
    return date.toLocaleString("default", { month: "short", year: "2-digit" });
  };

  return (
    <div className="text-white">
      <Card className="dark">
        <CardHeader>
          <CardTitle>Event Type Distribution by Month</CardTitle>
          <CardDescription>
            Stack of unique tracking IDs by Event Type per month
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={chartConfig}
            className="w-full h-[380px]"
          >
            <BarChart data={chartData} layout="horizontal">
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                reversed={true}
                tickFormatter={formatMonthYear}
              />
              <ChartTooltip content={<ChartTooltipContent />} cursor={false} />
              <Legend />
              {eventTypes.map(type => (
  <Bar key={type} dataKey={type} stackId="a" fill={chartConfig[type].color} name={type}>
    {chartData.some(data => data[type] >= 101) && (
      <LabelList 
        dataKey={type} 
        position="center" 
        fill="#fff" 
        fontSize={10} 
        fontWeight="bold"
      />
    )}
  </Bar>
))}
              <LabelList 
                dataKey="total" 
                position="top" 
                fill="var(--chart-1)" 
                fontSize={12} 
                fontWeight="bold"
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}

export default User2;