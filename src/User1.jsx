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

const chartConfig = {
  gclidString: {
    label: "From Marketing",
    color: "hsl(var(--chart-1))",
  },
  gclidNull: {
    label: "Organic",
    color: "hsl(var(--chart-2))",
  },
};

function User1() {
  const { userEvento } = useGlobalContext();
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (userEvento && userEvento.length > 0) {
      // Use a set for all unique trackingIds across the entire dataset
      const allTrackingIds = new Set();

      // Group data by month but ensure trackingId is only added once to the set
      const groupedData = userEvento.reduce((acc, event) => {
        const createdAtDate = new Date(event.createdAt);
        const monthYear = `${String(createdAtDate.getMonth() + 1).padStart(2, "0")}-${createdAtDate.getFullYear()}`;

        if (!acc[monthYear]) {
          acc[monthYear] = { gclidString: new Set(), gclidNull: new Set() };
        }
        
        if (!allTrackingIds.has(event.trackingId)) {
          if (typeof event.gclid === "string" && event.gclid !== null) {
            acc[monthYear].gclidString.add(event.trackingId);
          } else {
            acc[monthYear].gclidNull.add(event.trackingId);
          }
          allTrackingIds.add(event.trackingId);
        }

        return acc;
      }, {});

      const formattedData = Object.entries(groupedData)
      .map(([month, counts]) => ({
        month,
        gclidString: counts.gclidString.size,
        gclidNull: counts.gclidNull.size,
        total: counts.gclidString.size + counts.gclidNull.size,
      }))
      .sort((a, b) => new Date(`01-${b.month}`) - new Date(`01-${a.month}`));

      setChartData(formattedData);
    }
  }, [userEvento]);

  const formatMonthYear = (monthYear) => {
    const [month, year] = monthYear.split("-");
    const date = new Date(`${year}-${month}-01`);
    return date.toLocaleString("default", { month: "short", year: "2-digit" });
  };

  return (
    <div className="text-white">
      <Card className="dark">
        <CardHeader>
          <CardTitle>Trafic Source Distribution by Month</CardTitle>
          <CardDescription>
            Unique users (tracking IDs)  per month
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
              <Bar dataKey="gclidString" stackId="a" fill={chartConfig.gclidString.color} name="From Marketing">
                <LabelList 
                  dataKey="gclidString" 
                  position="center" 
                  fill="#fff" 
                  fontSize={10} 
                  fontWeight="bold"
                />
              </Bar>
              <Bar dataKey="gclidNull" stackId="a" fill={chartConfig.gclidNull.color} name="Organic">
                <LabelList 
                  dataKey="gclidNull" 
                  position="center" 
                  fill="#fff" 
                  fontSize={10} 
                  fontWeight="bold"
                />
              </Bar>
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

export default User1;