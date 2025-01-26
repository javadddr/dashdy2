import React, { useState, useEffect } from 'react';
import { Bar, BarChart, XAxis, YAxis, LabelList, Tooltip, Legend } from 'recharts';
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

function BarDate() {
  const { shipments, users, subscriptions, invoices,subscriptionsreal } = useGlobalContext();
  const [monthlyShipments, setMonthlyShipments] = useState([]);

  // Process shipments into a grouped format based on month and delivery status
  const processShipmentsData = () => {
    if (shipments && Array.isArray(shipments)) {
      const groupedByMonth = {};

      shipments.forEach(shipment => {
        const month = new Date(shipment.createdAt).toLocaleString('default', { month: 'short', year: 'numeric' });
        const status = shipment.delivery_status;

        if (!groupedByMonth[month]) {
          groupedByMonth[month] = {
            'Transit': 0,
            'Delivered': 0,
            'Pending': 0,
            'Created': 0,
            'Exception': 0,
          };
        }

        // Increment the count of shipments for each delivery status per month
        groupedByMonth[month][status] += 1;
      });

      // Convert the grouped data into the format needed for the chart
      const formattedData = Object.keys(groupedByMonth).map(month => ({
        month,
        Transit: groupedByMonth[month].Transit,
        Delivered: groupedByMonth[month].Delivered,
        Pending: groupedByMonth[month].Pending,
        Created: groupedByMonth[month].Created,
        Exception: groupedByMonth[month].Exception,
      }));

      setMonthlyShipments(formattedData);
    }
  };

  useEffect(() => {
    processShipmentsData();
  }, [shipments]);

  // Define the chart config
  const chartConfig = {
    Transit: {
      label: "Transit",
      color: "hsl(var(--chart-1))",
    },
    Delivered: {
      label: "Delivered",
      color: "hsl(var(--chart-2))",
    },
    Pending: {
      label: "Pending",
      color: "hsl(var(--chart-3))",
    },
    Created: {
      label: "Created",
      color: "hsl(var(--chart-4))",
    },
    Exception: {
      label: "Exception",
      color: "hsl(var(--chart-5))",
    },
  };

  return (
    <Card className="dark w-[350px] ml-2">
      <CardHeader>
        <CardTitle className="text-base">Shipments per Month</CardTitle>
        <CardDescription>Shipments' status by month</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            width={500}
            height={300}
            data={monthlyShipments}
            layout="horizontal"
            margin={{
              left: 0,
              right: 0,
              top: 10,
              bottom: 0,
            }}
          >
            <XAxis
              dataKey="month"
              type="category"
              tickLine={false}
            />
         
            <Tooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Legend />

            {/* Bar for each delivery status */}
            {Object.keys(chartConfig).map(status => (
              <Bar
                key={status}
                dataKey={status}
                stackId="a"
                fill={chartConfig[status].color}
                radius={[0, 0, 4, 4]}
              >
          
              </Bar>
            ))}
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export default BarDate;
