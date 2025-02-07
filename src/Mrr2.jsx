import React, { useMemo } from "react";
import { useGlobalContext } from "./GlobalProvider";
import { Card } from "@heroui/react";
import { Button } from "@heroui/react";

function Mrr2() {
  const { allsubs, subscriptions } = useGlobalContext();

  const getSubscriptionById = (id) => {
    const matchedSubscription = subscriptions.find((sub) => sub.id === id);
    return matchedSubscription ? ` ${matchedSubscription.email}` : "No matching subscription";
  };

  const timelineData = useMemo(() => {
    const groupedData = {};

    allsubs?.forEach((invoice) => {
      if (invoice.status === "active" || invoice.status === "canceled") {
        const date = new Date(invoice.created * 1000);
        const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        const customer = getSubscriptionById(invoice.customer);
        const amount = invoice.plan.amount / 100;

        if (!groupedData[monthYear]) {
          groupedData[monthYear] = { active: [], canceled: [] };
        }

        if (invoice.status === "active") {
          groupedData[monthYear].active.push({ customer, amount });
        } else {
          groupedData[monthYear].canceled.push({ customer, amount });
        }
      }
    });

    return Object.keys(groupedData)
      .sort((a, b) => new Date(`${a}-01`) - new Date(`${b}-01`))
      .map((monthYear) => ({
        month: new Date(`${monthYear}-01`).toLocaleString("default", { month: "short", year: "2-digit" }),
        active: groupedData[monthYear].active,
        canceled: groupedData[monthYear].canceled,
      }));
  }, [allsubs, subscriptions]);

  return (
    <div className="text-white overflow-x-auto p-4 flex justify-center">
      <Card className="dark w-full max-w-lg">
       

          <div className="relative border-l-4 border-gray-500 pl-6 space-y-6">
            {timelineData.map((monthData, index) => (
              <div key={index} className="relative">
                <div className="absolute -left-3 w-6 h-6 bg-gray-500 rounded-full"></div>
                <div className="text-lg font-bold text-gray-100 mb-2">{monthData.month}</div>
                <div className="flex flex-col space-y-2">
                  {monthData.active.map((entry, idx) => (
                    <Card key={idx} className="bg-green-600 p-2 text-xs text-white shadow-lg w-48">
                      {entry.customer} <br /> (${entry.amount.toFixed(0)})
                    </Card>
                  ))}
                </div>
                <div className="flex flex-col space-y-2 mt-3">
                  {monthData.canceled.map((entry, idx) => (
                    <Button key={idx} color="danger" size="sm" className="w-[150px]">
                      {entry.customer} <br /> (${entry.amount.toFixed(2)})
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>
     
      </Card>
    </div>
  );
}

export default Mrr2;
