import React, { useMemo } from "react";
import { useGlobalContext } from "./GlobalProvider";
import { Bar, BarChart, XAxis, LabelList } from "recharts";
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
  revenue: {
    label: "Revenue",
    color: "hsl(var(--chart-2))",
  },
  canceledRevenue: {
    label: "Canceled Revenue",
    color: "hsl(var(--chart-1))",
  },
};

function Mrr1() {
  const { allsubs } = useGlobalContext();

  const mrrData = useMemo(() => {
    const monthlyRevenueFirst = {};
    const monthlyCanceledRevenue = {};
    const countedCustomersActive = new Set();
    const countedCustomersCanceled = new Set();

    allsubs?.forEach((invoice) => {
      const date = new Date(invoice.created * 1000);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const amount = invoice.plan.amount / 100;
      const customerId = invoice.customer;

      if (invoice.status === "active") {
        if (!countedCustomersActive.has(customerId)) {
          countedCustomersActive.add(customerId);
          if (!monthlyRevenueFirst[monthYear]) {
            monthlyRevenueFirst[monthYear] = 0;
          }
          monthlyRevenueFirst[monthYear] += amount;
        }
      }
      
      if (invoice.status === "canceled") {
        if (!countedCustomersCanceled.has(customerId)) {
          countedCustomersCanceled.add(customerId);
          if (!monthlyCanceledRevenue[monthYear]) {
            monthlyCanceledRevenue[monthYear] = 0;
          }
          monthlyCanceledRevenue[monthYear] += amount;
        }
      }
    });

    const chartData = Object.keys({ ...monthlyRevenueFirst, ...monthlyCanceledRevenue }).map((monthYear) => ({
      month: monthYear,
      revenue: parseFloat((monthlyRevenueFirst[monthYear] || 0).toFixed(1)),
      canceledRevenue: parseFloat((monthlyCanceledRevenue[monthYear] || 0).toFixed(1)),
    })).sort((a, b) => new Date(`${a.month}-01`) - new Date(`${b.month}-01`));

    return { chartData };
  }, [allsubs]);

  const formatMonthYear = (monthYear) => {
    const [year, month] = monthYear.split("-");
    const date = new Date(`${year}-${month}-01`);
    return date.toLocaleString("default", { month: "short", year: "2-digit" });
  };

  return (
    <div className="text-white">
      <Card className="dark">
        <CardHeader>
          <CardTitle>Monthly Recurring Revenue (MRR)</CardTitle>
          <CardDescription>Revenue per month (Paid & Canceled Invoices)</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="min-w-[1330px] h-[380px]">
            <BarChart data={mrrData.chartData} layout="horizontal">
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={formatMonthYear}
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
              <Bar dataKey="revenue" fill="hsl(var(--chart-2))" radius={4}>
                <LabelList position="top" offset={12} className="fill-foreground" fontSize={12} />
              </Bar>
              <Bar dataKey="canceledRevenue" fill="hsl(var(--chart-5))" radius={4}>
                <LabelList position="top" offset={12} className="fill-red-500" fontSize={12} />
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}

export default Mrr1;
