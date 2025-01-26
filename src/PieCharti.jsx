import React, { useState, useEffect, useMemo } from 'react';
import { Pie, PieChart, Label, LabelList, Cell } from 'recharts';
import { useGlobalContext } from "./GlobalProvider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from './components/ui/chart';

function PieCharti() {
  const { shipments, users, subscriptions, invoices,subscriptionsreal } = useGlobalContext();

  const [statusShipments, setStatusShipments] = useState({
    'Transit': [],
    'Delivered': [],
    'Pending': [],
    'Created': [],
    'Exception': [],
  });

  // Filter shipments based on their createdAt and delivery status
  useEffect(() => {
    if (shipments && Array.isArray(shipments)) {
      const now = new Date();
      const sevenDaysAgo = new Date(now.setDate(now.getDate() - 7)); // Get date for 7 days ago

      // Filter shipments from the past 7 days and group by status
      const filteredShipments = {
        'Transit': [],
        'Delivered': [],
        'Pending': [],
        'Created': [],
        'Exception': [],
      };

      shipments.forEach(shipment => {
        const createdAt = new Date(shipment.createdAt);
        if (createdAt >= sevenDaysAgo && createdAt <= new Date()) {
          if (filteredShipments[shipment.delivery_status]) {
            filteredShipments[shipment.delivery_status].push(shipment);
          }
        }
      });

      setStatusShipments(filteredShipments); // Update the statusShipments state with the filtered data
    }
  }, [shipments]); // Re-run effect when shipments data changes

  // Prepare chart data for rendering
  const chartData = useMemo(() => {
    return Object.entries(statusShipments).map(([status, shipmentsForStatus]) => ({
      name: status,
      value: shipmentsForStatus.length,
      fill: `hsl(var(--chart-${Object.keys(statusShipments).indexOf(status) + 1}))`
    }));
  }, [statusShipments]);

  const chartConfig = {
    Transit: {
      label: "Transit",
      color: "hsl(var(--chart-1))",
    },
    Pending: {
      label: "Pending",
      color: "hsl(var(--chart-2))",
    },
    Created: {
      label: "Created",
      color: "hsl(var(--chart-3))",
    },
    Exception: {
      label: "Exception",
      color: "hsl(var(--chart-4))",
    },
    Delivered: {
      label: "Delivered",
      color: "hsl(var(--chart-5))",
    },
  };

  return (
    <Card className='dark w-[350px] ml-2'>
      <CardHeader>
        <CardTitle className='text-base'>Shipments Status</CardTitle>
        <CardDescription>This week</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <PieChart width={300} height={300}>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={50}
              outerRadius={85}
              fill="gray"
              strokeWidth={65}
            >
              {chartData.map((entry, index) => (
                <React.Fragment key={entry.name}>
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                  <LabelList
                      dataKey="name"
                      className="fill-background"
                      stroke="none"
                      fontSize={12}
                      position="inside"
                      formatter={(value) => {
                        const entry = chartData.find(item => item.name === value);
                        return entry ? entry.value : 0;
                      }}
                    />

                </React.Fragment>
              ))}
              <Label
                key="totalShipmentsLabel"
                content={({ viewBox }) => {
                  if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {chartData.reduce((total, entry) => total + entry.value, 0).toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Shipments
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export default PieCharti;
