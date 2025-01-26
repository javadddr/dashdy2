"use client";

import React, { useState, useEffect } from "react";
import { Button, Card, Chip, cn } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useGlobalContext } from "./GlobalProvider";

export default function ChatHed() {
  const { shipments, users, subscriptions, invoices,subscriptionsreal } = useGlobalContext();
 
  const [totalAmountOf, setTotalAmountOf] = useState(0); // State to store the AOV
  // Add a loading state for when the users data is being fetched




  useEffect(() => {
    if (!invoices || invoices.length === 0) {
      setTotalAmountOf(0); // Set to 0 if there are no invoices
      return;
    }

    // Use a Set to track unique customer emails
    const uniqueCustomers = new Set();
    let totalAmount = 0;

    invoices.forEach((invoice) => {
      const customerEmail = invoice.customer_email; // Customer email
      if (customerEmail) {
        uniqueCustomers.add(customerEmail); // Add unique customer email to the Set
      }

      // Safely access the amount and add to the total
      const amount = invoice.lines?.data?.[0]?.amount || 0;
      totalAmount += amount;
    });

    // Calculate the average order value (AOV)
    const numberOfCustomers = uniqueCustomers.size;
    const averageOrderValue = numberOfCustomers > 0 ? totalAmount / numberOfCustomers : 0;

    // Store the AOV in the state
    setTotalAmountOf(averageOrderValue);
  }, [invoices]); // Recalculate whenever `invoices` changes
  console.log("totalAmountOf",totalAmountOf)
  const totalusers=users.length?users.length:0
  const totalbill=subscriptions.length?subscriptions.length:0
  const totalbillREAL=subscriptionsreal.length?subscriptionsreal.length:0
  
  const data = [
    {
      title: "Total Users",
      value:totalusers?totalusers:"Loading...",
      change: "33%",
      changeType: "positive",
      trendChipPosition: "top",
      iconName: "solar:users-group-rounded-linear",
    },
    {
      title: "Billing Page Visit (% Of Users)",
      value: `${totalbill===0?"Loading...":((totalbill/totalusers)*100).toFixed(1)}%`,
      change: "0.0%",
      changeType: "neutral",
      trendChipPosition: "top",
      iconName: "solar:wallet-money-outline",
    },
    {
      title: "Sign-up to paying customer",
      value: `${totalbillREAL===0?"Loading...":((totalbillREAL/totalusers)*100).toFixed(1)}%`,
      change: "3.3%",
      changeType: "negative",
      trendChipPosition: "top",
      iconName: "solar:hand-money-linear",
    },
    {
      title: "AOV",
      value: `${totalAmountOf===0?"Loading...": (totalAmountOf/100).toFixed(2)} $`,
      change: "3.3%",
      changeType: "negative",
      trendChipPosition: "top",
      iconName: "solar:hand-money-linear",
    },
   
  ];

  return (
    <dl className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-4 dark p-7 px-20">
      {data.map(({ title, value, change, changeType, iconName, trendChipPosition }, index) => (
        <Card key={index} className="border border-transparent dark:border-default-100">
          <div className="flex p-4">
            <div
              className={cn("mt-1 flex h-8 w-8 items-center justify-center rounded-md", {
                "bg-success-50": changeType === "positive",
                "bg-warning-50": changeType === "neutral",
                "bg-danger-50": changeType === "negative",
              })}
            >
              {changeType === "positive" ? (
                <Icon className="text-success" icon={iconName} width={20} />
              ) : changeType === "neutral" ? (
                <Icon className="text-warning" icon={iconName} width={20} />
              ) : (
                <Icon className="text-danger" icon={iconName} width={20} />
              )}
            </div>

            <div className="flex flex-col gap-y-2">
              <dt className="mx-4 text-small font-medium text-default-500">{title}</dt>
              <dd className="px-4 text-2xl font-semibold text-default-700">{value}</dd>
            </div>

          
          </div>

        
        </Card>
      ))}
    </dl>
  );
}
