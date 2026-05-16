import React, { useEffect, useState } from "react";
import { useGlobalContext } from "./GlobalProvider";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
} from "recharts";

/* Required by shadcn ChartContainer */
const chartConfig = {
  count: {
    label: "Subscriptions",
  },
};

function Subis() {
  const { subscriptionsreal } = useGlobalContext();
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (!Array.isArray(subscriptionsreal)) return;

    const monthMap = {};

    subscriptionsreal.forEach((sub) => {
      if (!sub.created) return;

      // Group by MONTH
      const date = new Date(sub.created * 1000);
      const key = `${date.getFullYear()}-${date.toLocaleString("en-US", {
        month: "short",
      })}`;

      monthMap[key] = (monthMap[key] || 0) + 1;
    });

    const formatted = Object.entries(monthMap)
      .map(([month, count]) => ({ month, count }))
      .sort(
        (a, b) =>
          new Date(a.month + "-01").getTime() -
          new Date(b.month + "-01").getTime()
      );

    setChartData(formatted);
  }, [subscriptionsreal]);

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Monthly Subscriptions</CardTitle>
        </CardHeader>

        <CardContent className="h-[320px]">
          <ChartContainer config={chartConfig}>
            <LineChart data={chartData}>
              <XAxis dataKey="month" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                dataKey="count"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}

export default Subis;
