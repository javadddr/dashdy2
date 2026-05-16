import React, { useState, useEffect } from "react";
import { Bar, BarChart,LabelList, CartesianGrid, XAxis } from "recharts";
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
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";

// Helper function to extract category from message
const extractCategory = (message) => {
  if (!message.text || !message.text[0]) return "Other";
  
  const firstText = message.text[0];
  if (firstText.type === "bold" && firstText.text === "New signup") {
    return "New Signup";
  } else if (firstText.type === "bold" && firstText.text === "New Payment") {
    return "New Payment";
  }
  return "Other";
};

// Helper to get month-year from date
const getMonthYear = (dateString) => {
  const date = new Date(dateString);
  return `${String(date.getMonth() + 1).padStart(2, "0")}-${date.getFullYear()}`;
};

// Helper to format month display
const formatMonthYear = (monthYear) => {
  const [month, year] = monthYear.split("-");
  const date = new Date(`${year}-${month}-01`);
  return date.toLocaleString("default", { month: "short", year: "2-digit" });
};

const chartConfig = {
  newSignup: {
    label: "New Signup",
    color: "hsl(var(--chart-1))",
  },
  newPayment: {
    label: "New Payment",
    color: "hsl(var(--chart-2))",
  },
  other: {
    label: "Other",
    color: "hsl(var(--chart-4))",
  },
};

function MessageStackedBarChart() {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/result.json');
        const data = await response.json();
        
        const messages = Array.isArray(data) ? data : data.messages || [];
        
        // Group by month and category
        const groupedData = {};
        
        messages.forEach(message => {
          if (message.type === "message") {
            const monthYear = getMonthYear(message.date);
            const category = extractCategory(message);
            
            if (!groupedData[monthYear]) {
              groupedData[monthYear] = {
                month: monthYear,
                newSignup: 0,
                newPayment: 0,
                other: 0,
              };
            }
            
            if (category === "New Signup") groupedData[monthYear].newSignup++;
            else if (category === "New Payment") groupedData[monthYear].newPayment++;
            else if (category === "Other") groupedData[monthYear].other++;
          }
        });
        
        // Convert to array and sort
        const formattedData = Object.values(groupedData)
          .sort((a, b) => {
            const [monthA, yearA] = a.month.split("-");
            const [monthB, yearB] = b.month.split("-");
            return new Date(`${yearA}-${monthA}`) - new Date(`${yearB}-${monthB}`);
          });
        
        setChartData(formattedData);
        setLoading(false);
      } catch (error) {
        console.error("Error loading data:", error);
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  if (loading) {
    return (
      <Card className="dark">
        <CardHeader>
          <CardTitle>Message Analytics</CardTitle>
          <CardDescription>Loading chart data...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="text-white mt-6">
      <Card className="">
        <CardHeader>
          <CardTitle>Message Analytics by Category</CardTitle>
          <CardDescription>
            Stacked bar chart showing New Signups, New Payments, and Other messages grouped by month
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={chartConfig}
            className="min-w-[1330px] h-[380px]"
          >
            <BarChart data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => formatMonthYear(value)}
              />
              <ChartTooltip content={<ChartTooltipContent hideLabel />} cursor={false} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar
                dataKey="other"
                stackId="a"
                fill="var(--color-other)"
                radius={[0, 0, 4, 4]}
              >
               <LabelList
                  dataKey="other"
                  position="middle"
                  fill="#070807"
                  fontSize={12}
                  fontWeight="bold"
                />
              </Bar>
              <Bar
                dataKey="newPayment"
                stackId="a"
                fill="var(--color-newPayment)"
                radius={[0, 0, 0, 0]}
              >

                <LabelList
                  dataKey="newPayment"
                  position="middle"
                  fill="#070807"
                  fontSize={12}
                  fontWeight="bold"
                />
              </Bar>
              <Bar
                dataKey="newSignup"
                stackId="a"
                fill="var(--color-newSignup)"
                radius={[4, 4, 0, 0]}
              >
                     <LabelList
                  dataKey="newSignup"
                  position="middle"
                  fill="#070807"
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

export default MessageStackedBarChart;