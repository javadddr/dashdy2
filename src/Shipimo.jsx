import React, { useState, useEffect } from "react";
import { Bar, BarChart, XAxis, YAxis, Tooltip, Legend } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./components/ui/card";
import { ChartContainer, ChartTooltipContent } from "./components/ui/chart";

function Shipimo({ email,shipments }) {

  const [filterShip, setFilterShip] = useState([]);
  const [weeklyShipments, setWeeklyShipments] = useState([]);

  // Filter shipments by email
  useEffect(() => {
    const extractedEmail = email.match(/\(([^)]+)\)/)?.[1];
    if (shipments?.length > 0) {
      const filtered = shipments.filter(
        (shipment) => shipment?.owner?.email === extractedEmail
      );
      setFilterShip(filtered);
    }
  }, [shipments, email]);

  // Process shipments into weekly data
  useEffect(() => {
    if (filterShip.length > 0) {
      const groupedByWeek = {};

      filterShip.forEach((shipment) => {
        // Calculate the week number of the year
        const createdAt = new Date(shipment.createdAt);
        const week = `${createdAt.getFullYear()}-W${Math.ceil(
          (createdAt.getDate() + createdAt.getDay()) / 7
        )}`;
        const status = shipment.delivery_status;

        if (!groupedByWeek[week]) {
          groupedByWeek[week] = {
            week,
            Transit: 0,
            Delivered: 0,
            Pending: 0,
            Created: 0,
            Exception: 0,
          };
        }

        groupedByWeek[week][status] += 1;
      });

      // Format data for the chart
      const formattedData = Object.values(groupedByWeek);
      setWeeklyShipments(formattedData);
    }
  }, [filterShip]);

  // Chart configuration
  const chartConfig = {
    Transit: { label: "Transit", color: "hsl(var(--chart-1))" },
    Delivered: { label: "Delivered", color: "hsl(var(--chart-2))" },
    Pending: { label: "Pending", color: "hsl(var(--chart-3))" },
    Created: { label: "Created", color: "hsl(var(--chart-4))" },
    Exception: { label: "Exception", color: "hsl(var(--chart-5))" },
  };

  return (
    <Card className="dark  ml-2">
      <CardHeader>
        <CardTitle className="text-base">Weekly Shipments</CardTitle>
        <CardDescription>Shipments' status by week</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}    className="min-w-[830px] h-[280px]">
          <BarChart
       
            data={weeklyShipments}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <XAxis dataKey="week" type="category" />
        
            <Tooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Legend />
            {Object.keys(chartConfig).map((status) => (
              <Bar
                key={status}
                dataKey={status}
                stackId="a"
                fill={chartConfig[status].color}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export default Shipimo;
