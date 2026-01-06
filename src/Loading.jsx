import React from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardBody, Spinner } from "@nextui-org/react"; // Adjust imports based on your setup
import { useGlobalContext } from "./GlobalProvider";

function Loading() {
  const { shipments, users, userEvento, subscriptions, invoices,subscriptionsreal } = useGlobalContext();


  // Helper function to check if all data is loaded
  const isAllDataLoaded = [
    shipments,
    users,
    subscriptions,
    subscriptionsreal,
    invoices,
    userEvento,
  ].every((data) => data.length > 0);

  // Cards data
  const cardsData = [
    { title: "Subscriptions", data: subscriptions },
    { title: "Real Subscriptions", data: subscriptionsreal },
    { title: "Invoices", data: invoices },
    { title: "Shipments", data: shipments },
    { title: "Users", data: users },
    { title: "Users Events", data: userEvento },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-zinc-950">
      {isAllDataLoaded ? (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-md"
        >
          <Card className="shadow-lg dark">
            <CardHeader className="text-center border-b border-gray-300 dark:border-gray-700">
              <h3 className="text-2xl font-bold text-green-500 dark:text-green-400">
                🎉 All Data is Ready!
              </h3>
            </CardHeader>
            <CardBody className="text-center">
              <p className="text-lg">Your data is fully loaded and ready for you!</p>
            </CardBody>
          </Card>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cardsData.map(({ title, data }) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              <Card className="shadow-lg dark">
                <CardHeader className="text-center border-b border-gray-300 dark:border-gray-700">
                  <h3 className="text-lg font-semibold">{title}</h3>
                </CardHeader>
                <CardBody className="flex justify-center items-center h-32">
                  {data.length > 0 ? (
                    <div className="flex items-center space-x-2">
                      <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                      <span className="text-green-500 font-medium">
                        Loaded
                      </span>
                    </div>
                  ) : (
                    <Spinner size="lg" color="primary" />
                  )}
                </CardBody>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Loading;
