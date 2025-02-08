import React, { useState, useMemo } from "react";
import { format, startOfYear, endOfYear, eachMonthOfInterval, eachDayOfInterval, endOfMonth, getWeeksInMonth, startOfMonth, addDays } from "date-fns";
import { useGlobalContext } from "./GlobalProvider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
} from "@heroui/react";
function CustomHeatmap({ data, startDate, endDate, allsubs, setAllsub,onOpen }) {
  // Generate all days in the range, grouped by month
  const heatmapData = useMemo(() => {
    const months = eachMonthOfInterval({ start: startDate, end: endDate });

    return months.map((monthStart) => {
      const daysInMonth = eachDayOfInterval({
        start: monthStart,
        end: endOfMonth(monthStart),
      });

      // Calculate the number of rows (weeks) for the current month
      const rows = Math.ceil(daysInMonth.length / 7); // 7 days in a week

      return {
        days: daysInMonth,
        rows,
        monthStart,
      };
    });
  }, [startDate, endDate]);

  const getValueForDate = (date) => {
    const formattedDate = format(date, "yyyy-MM-dd");
    return data.find((d) => d.date === formattedDate)?.count || 0;
  };

  const getColorClass = (value) => {
    if (value === 0) return "bg-gray-100 text-gray-700"; // No activity
    if (value > 0) {
      if (value <= 10) return "bg-green-100 text-green-700";
      if (value <= 50) return "bg-green-300 text-green-900";
      return "bg-green-500 text-white";
    } else {
      if (value >= -10) return "bg-red-100 text-red-700";
      if (value >= -50) return "bg-red-300 text-red-900";
      return "bg-red-500 text-white";
    }
  };

  return (
    <div className="overflow-x-auto">
      {/* Organize months in two rows */}
      <div className="grid grid-cols-6 gap-4">
        {heatmapData.map((monthData, monthIndex) => (
          <div key={monthIndex}>
            {/* Month label */}
            <div className="text-gray-100 font-bold">
              {format(monthData.monthStart, "MMM")}
            </div>

            {/* Grid: Days of the week */}
            <div className="grid grid-cols-7 gap-1">
              {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
                <div key={index} className="text-sm text-gray-400 text-center">
                  {day}
                </div>
              ))}
            </div>

            {/* Grid: Days */}
            <div
              className={`grid grid-cols-7 gap-1 grid-rows-${monthData.rows}`}
              style={{ gridTemplateRows: `repeat(${monthData.rows}, 1fr)` }}
            >
              {monthData.days.map((day, dayIndex) => {
                const value = getValueForDate(day);
                return (
                  <div
                  key={dayIndex}
                  className={`h-8 w-8 flex items-center justify-center border hover:border-gray-500 text-xs font-bold 
                    ${value === 0 ? 'bg-gray-800' : getColorClass(value)} 
                    ${value !== 0 ? 'cursor-pointer' : ''}`}
                  title={`${format(day, "yyyy-MM-dd")}: ${value > 0 ? "+" : ""}${value}€`}
                  onClick={() => {
                    if (value !== 0) { // Klick nur zulassen, wenn Wert vorhanden ist
                      const selectedDate = format(day, "yyyy-MM-dd");
                      const filteredSubs = allsubs.filter(sub => format(new Date(sub.created * 1000), "yyyy-MM-dd") === selectedDate);
                      setAllsub(filteredSubs);
                      onOpen();
                    }
                  }}
                >
                  <span className="text-xs">{value !== 0 ? `${value}` : ""}</span>
                </div>
                
                
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Mrr2() {
  const { allsubs,subscriptions } = useGlobalContext();
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [allsub, setAllsub] = useState([]);
  const {isOpen, onOpen, onOpenChange} = useDisclosure();
  const getSubscriptionById = (id) => {
    const matchedSubscription = subscriptions.find(
      (subscription) => subscription.id === id
    );
    return matchedSubscription
      ? `${matchedSubscription.name} : (${matchedSubscription.email})`
      : "No matching subscription";
  };
console.log("allsub",allsub)
  // Set start and end date for the selected year
  const START_DATE = startOfYear(new Date(currentYear, 0, 1)); // First day of the current year
  const END_DATE = endOfYear(new Date(currentYear, 11, 31)); // Last day of the current year

  // Process data for the heatmap
  const heatmapData = useMemo(() => {
    const dataMap = {};

    allsubs?.forEach((invoice) => {
      if (invoice.status !== "active" && invoice.status !== "canceled") return;

      const date = format(new Date(invoice.created * 1000), "yyyy-MM-dd");
      const amount = invoice.plan.amount / 100;

      if (!dataMap[date]) {
        dataMap[date] = { total: 0, status: invoice.status };
      }

      if (invoice.status === "active") {
        dataMap[date].total += amount;
      } else if (invoice.status === "canceled") {
        dataMap[date].total -= amount;
      }
    });

    return Object.keys(dataMap).map((date) => ({
      date,
      count: dataMap[date].total,
    }));
  }, [allsubs]);

  const goToPreviousYear = () => setCurrentYear(currentYear - 1);
  const goToNextYear = () => setCurrentYear(currentYear + 1);

  return (
    <div>
    <div className="p-6  min-h-screen text-white">
      <Card className="bg-zinc-950 border-gray-700">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-white">Subscription Activity for {currentYear}</CardTitle>
          <CardDescription className="text-gray-300">
            Gains (Green) & Losses (Red) for {currentYear}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between mb-4">
            <Button onPress={goToPreviousYear} radius="sm" color="warning" variant="flat">
              Previous Year
            </Button>
            <Button onPress={goToNextYear} radius="sm" color="warning" variant="flat">
              Next Year
            </Button>
          </div>
          <CustomHeatmap
            data={heatmapData}
            startDate={START_DATE}
            endDate={END_DATE}
            allsubs={allsubs}
            setAllsub={setAllsub}
            onOpen={onOpen} // Hier übergeben wir onOpen als Prop
          />


        </CardContent>
      </Card>
    </div>
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} className="dark text-white">
  <ModalContent>
    {(onClose) => (
      <>
        <ModalHeader className="flex flex-col gap-1">Subscriptions</ModalHeader>
        <ModalBody>
          {allsub.length > 0 ? (
            allsub.map((sub, index) => (
              <div key={index} className="border-b py-2">
                <p className="font-bold">{getSubscriptionById(sub.customer)}</p>
                <p>Amount: {sub.items.data[0].plan.amount / 100}€</p>
                <p>Interval: {sub.items.data[0].plan.interval}</p>
              </div>
            ))
          ) : (
            <p>No subscriptions found.</p>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={onClose}>
            Close
          </Button>
       
        </ModalFooter>
      </>
    )}
  </ModalContent>
</Modal>

  </div>
  );
}

export default Mrr2;
