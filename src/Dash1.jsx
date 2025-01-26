import React from "react";
import BarCharti from "./BarCharti";
import PieCharti from "./PieCharti";
import BarDate from "./BarDate";
import Customers from "./Customers";
import SubChange from "./SubChange";
import Linein from "./Linein";
import Tranchart from "./Tranchart";
import TransAmountChart from "./TransAmountChart";
import SubChange2 from "./SubChange2";
import SubChangeac from "./SubChangeac";
import SubChangeac2 from "./SubChangeac2";
import ChatHed from "./ChatHed";
import Overall from "./Overall";
import Loading from "./Loading";
import { useGlobalContext } from "./GlobalProvider";


function Dash1() {
  const { shipments, users, subscriptions, invoices,subscriptionsreal } = useGlobalContext();


  // Check if all data is loaded
  const isAllDataLoaded = [
    shipments,
    users,
    subscriptions,
    subscriptionsreal,
    invoices,
  ].every((data) => data.length > 0);

  return (
    <div className="flex bg-zinc-950 flex-col min-h-screen">
      {/* Show Loading component until all data lengths are not zero */}
      {!isAllDataLoaded ? (
        <Loading />
      ) : (
        <>
         <div className="flex justify-center items-center w-full">
            <div className="flex flex-col mb-4">
              <ChatHed />
              <Overall />
            </div>
          </div>
          <div className="flex justify-center pt-2">
            <BarCharti />
            <PieCharti />
            <BarDate />
          </div>
          <div className="flex justify-center items-center w-full">
            <div className="flex gap-2 mb-4">
              <Linein />
              <Tranchart />
              <TransAmountChart />
            </div>
          </div>
          <div className="flex justify-center items-center w-full">
            <div className="flex gap-2 mb-4">
              <SubChangeac />
              <SubChangeac2 />
              <SubChange2 />
              <SubChange />
            </div>
          </div>
          <Customers />
         
         
        </>
      )}
    </div>
  );
}

export default Dash1;
