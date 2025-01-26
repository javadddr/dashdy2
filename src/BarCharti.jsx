import React, { useState, useEffect } from 'react';
import { TrendingUp } from 'lucide-react';
import { Bar, BarChart, XAxis, YAxis, LabelList } from 'recharts';
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

function BarCharti() {
  const { shipments, users, subscriptions, invoices,subscriptionsreal } = useGlobalContext();
  const [statusShipments, setStatusShipments] = useState({
    'Transit': [],
    'Delivered': [],
    'Pending': [],
    'Created': [],
    'Exception': [],
    
  });

  const filterShipmentsByStatus = (status) => {
    if (shipments && Array.isArray(shipments)) {
      const filteredShipments = shipments.filter(shipment => shipment.delivery_status === status);
      setStatusShipments(prev => ({
        ...prev,
        [status]: filteredShipments
      }));
    }
  };

  useEffect(() => {
    Object.keys(statusShipments).forEach(status => {
      filterShipmentsByStatus(status);
    });
  }, [shipments]);

  const chartData = Object.entries(statusShipments).map(([status, shipmentsForStatus]) => ({
    browser: status,
    visitors: shipmentsForStatus.length,
    fill: `hsl(var(--chart-${Object.keys(statusShipments).indexOf(status) +1}))`
  }));

  const chartConfig = {
    visitors: {
      label: "Shipments",
    },
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
      color: "hsl(var(--chart-1))",
    },
    Delivered: {
      label: "Delivered",
      color: "hsl(var(--chart-1))",
    },
  };

  return (
    <Card className='dark w-[350px] ml-2'>
      <CardHeader>
        <CardTitle className='text-base'>Shipments' status</CardTitle>
        <CardDescription>One month</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} >
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="horizontal"
            margin={{
              left: 0,
              bottom: 0,
              top:10
            }}
          >
            <XAxis 
              dataKey="browser"
              type="category"
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => chartConfig[value]?.label}
              interval={0} 
            />
       
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar 
              dataKey="visitors"
              radius={[4, 4, 0, 0]} // Rounded top corners for horizontal bars
            >
              <LabelList 
                dataKey="visitors" 
                position="top" 
                offset={5}
                fill="white" // Changed to white for better visibility in dark mode
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export default BarCharti;